import React from 'react';

import Select from 'react-select';
import PlacesAutocomplete from 'react-places-autocomplete'
import {formatResult} from '../helpers/geocodeFormatter'
import googleMaps from '@google/maps'

export default class EditHotel extends React.Component {

    constructor(props) {
      super(props);
      let googleMapsClient = googleMaps.createClient({
        key: MAPS_API,
        Promise: Promise
      });
      this.state = {
        hotel: Object.assign({}, props.hotel),
        image: {},
        googleMapsClient: googleMapsClient
      }
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.hotel !== nextProps.hotel) {
        let address;
        this.setState({ hotel: Object.assign({}, nextProps.hotel), image: {}, address: address });
      }
    }

    editHotelInfo(info) {
      this.setState({ hotel: Object.assign(this.state.hotel, info) });
    }

    onPlacesChange(address) {
      this.setState({address: address});
    }

    onlyDefined(val, append='') { return (val ? val + append : ''); }

    async handlePlacesSelect(address, placeId) {
      this.setState({address: address});
      //Get the geocode and format it
      let geoCode = await this.state.googleMapsClient.geocode({address: address}).asPromise();
      geoCode = formatResult(geoCode.json.results[0]);
      //Get the timezone from coordinates
      let location = {latitude: geoCode.latitude, longitude: geoCode.longitude};
      let timezone = await this.state.googleMapsClient.timezone({location: location}).asPromise();
      //Filter out undefined values
      let hotelLocation = {
        lineOne: this.onlyDefined(geoCode.streetNumber, ', ') + this.onlyDefined(geoCode.streetName),
        lineTwo: this.onlyDefined(geoCode.streetNumber, ', ') + this.onlyDefined(geoCode.streetName, ', ') + geoCode.administrativeLevels.join(', '),
        zip: this.onlyDefined(geoCode.zipcode),
        country: this.onlyDefined(geoCode.countryCode),
        latitude: geoCode.latitude,
        longitude: geoCode.longitude,
        timezone: timezone.json.timeZoneId
      }
      this.setState({
        hotel: Object.assign(this.state.hotel, hotelLocation)
      })
    }

    render() {
      const placesInputProps = {
        value: this.state.address,
        onChange: (address) => { this.onPlacesChange(address)}
      }
      const cssClasses = {
        input: 'form-control'
      }
      return(
        <form class="box" onSubmit={(e) => {e.preventDefault(); this.props.editHotel(this.state.hotel, this.state.image, this.state.password)}}>
          <h3>
            Edit Hotel
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={this.props.onBack}>Back to hotels</button>
            </div>
          </h3>
          <div class="form-group">
            <label>Choose a hotel</label>
            <Select
              name="Hotels"
              clearable={false}
              options={this.props.hotelOptions}
              value={this.state.hotel.address}
              onChange={(e) => { this.props.onHotelChange(e.value) }}
            />
          </div>
          <hr></hr>
          {(this.state.hotel.address != "") ?
          <div>
            <div class="form-group">
              <Select
                name="Edit Parameter"
                clearable={false}
                value={this.props.editHotelFunction}
                autoFocus="true"
                options={this.props.editHotelFunctions}
                onChange={e => this.props.onFunctionChange(e.value)}
              />
            </div>
            <hr></hr>
            {{
              changeHotelAddress: (
                <div>
                  <div class="form-group">
                    <label>Search for Address</label>
                    <PlacesAutocomplete
                      inputProps={placesInputProps}
                      classNames={cssClasses}
                      onSelect={(address, placeId) => this.handlePlacesSelect(address, placeId)}
                    />
                  </div>
                  <div class="form-group">
                    <label>Address One</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.lineOne || ''}
                      onChange={e => this.editHotelInfo({lineOne: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Address Two</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.lineTwo || ''}
                      onChange={e => this.editHotelInfo({lineTwo: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.zip || ''}
                      onChange={e => this.editHotelInfo({zip: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.country || ''}
                      onChange={e => this.editHotelInfo({country: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Timezone</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.timezone || ''}
                      onChange={e => this.editHotelInfo({timezone: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Latitude</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.latitude || ''}
                      onChange={e => this.editHotelInfo({latitude: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Longitude</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.longitude || ''}
                      onChange={e => this.editHotelInfo({longitude: e.target.value})}
                    />
                  </div>
                </div>
              ),
              changeHotelInfo: (
                <div>
                  <div class="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      autoFocus="true"
                      class="form-control"
                      value={this.state.hotel.name || ''}
                      onChange={e => this.editHotelInfo({name: e.target.value})}
                    />
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      class="form-control"
                      value={this.state.hotel.description || ''}
                      onChange={e => this.editHotelInfo({description: e.target.value})}
                    />
                  </div>
                </div>
              ),
              setRequireConfirmation: (
                <div class="form-group">
                  <label>Confirmation Required</label>
                  <input
                    type="checkbox"
                    class="form-control"
                    checked={this.state.hotel.waitConfirmation}
                    onChange={e => this.editHotelInfo({waitConfirmation: e.target.checked})}
                  />
                </div>
              ),
              addImageHotel: (
                <div>
                  <div class="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      class="form-control"
                      value={this.state.image.imageUrl || ''}
                      onChange={e => this.setState({ image: { imageUrl: e.target.value } })}
                    />
                  </div>
                  <div class="form-group">
                    <label>Preview</label>
                    <img class="img-fluid" src={this.state.image.imageUrl} />
                  </div>
                </div>
              ),
              removeImageHotel: (
                <div>
                  <div class="form-group">
                    <label>Image to Remove</label>
                    <Select
                      name="Image"
                      clearable={false}
                      value={this.state.image.imageUrl || ''}
                      autoFocus="true"
                      options={this.state.hotel.images.map((url, i)=> {return {value: i, label: url}}).filter(e => e.label)}
                      onChange={e => this.setState({ image: { imageUrl: e.label, imageIndex: e.value } })}
                    />
                  </div>
                  <div class="form-group">
                    <label>Preview</label>
                    <img class="img-fluid" src={this.state.image.imageUrl} />
                  </div>
                </div>
              ),
              removeHotel: (
                <div class="form-group">
                  <label>Enter your password below to remove this hotel</label>
                </div>
              )
            }[this.props.editHotelFunction]}
            <div class="form-group">
              <label>Your Wallet Password</label>
              <div class="input-group">
                <input
                  type={this.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={this.state.password}
                  onChange={(event) => {
                    this.setState({ password: event.target.value });
                  }}
                />
                <span class="input-group-addon">
                  {this.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => this.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => this.setState({showPassword: true})}></span>
                  }
                </span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update hotel details</button>
          </div>
          : null}
        </form>
      );
    }

}
