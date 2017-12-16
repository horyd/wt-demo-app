import React from 'react';

import Select from 'react-select';

export default class EditUnitType extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        newUnitType: Object.assign({}, props.unitTypeInfo),
        image: {}
      }
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.hotel !== nextProps.hotel) {
        this.setState({ newUnitType: Object.assign({}, props.unitTypeInfo), image: {} });
      }
    }

    resetUnitType() {
      let newUnitType = {};
      newUnitType.description = (this.props.unitTypeInfo.description || '');
      newUnitType.minGuests = (this.props.unitTypeInfo.minGuests || '');
      newUnitType.maxGuests = (this.props.unitTypeInfo.maxGuests || '');
      newUnitType.price = (this.props.unitTypeInfo.price || '');
      this.setState({ newUnitType: newUnitType });
    }

    editUnitTypeInfo(info) {
      this.setState({ newUnitType: Object.assign(this.state.newUnitType, info) });
    }

    render() {
      return(
        <form class="box" onSubmit={(e) => {e.preventDefault(); this.props.editUnitType(this.state.newUnitType, this.state.image, this.state.password)}}>
          <h3>
            Edit Room Type
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={this.props.onBack}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{this.props.hotel.name}</h4>
          <hr></hr>
          <div class="form-group">
            <label>Room Type</label>
            <Select
              name="Room Types"
              clearable={false}
              value={this.props.unitType}
              autoFocus="true"
              placeholder="Double Room"
              options={this.props.unitTypeOptions}
              onChange={e => { this.resetUnitType(); this.props.onUnitTypeChange(e.value); }}
            />
            <button type="button" class="btn btn-link" onClick={this.props.onAddUnitType}>
              Or create a new room type
            </button>
          </div>
          <hr></hr>
          <div class="form-group">
            <Select
              name="Edit Parameter"
              clearable={false}
              value={this.props.editHotelUnitTypeFunction}
              autoFocus="true"
              options={this.props.editHotelUnitTypeFunctions}
              onChange={e => this.props.onFunctionChange(e.value)}
            />
          </div>
          <hr></hr>
          {this.props.unitTypeInfo && {
            editUnitType: (
              <div>
                <div class="form-group">
                  <label>Room description</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="A fancy and spacious room with the best amenities"
                    value={this.state.newUnitType.description || ''}
                    onChange={e => this.editUnitTypeInfo({description: e.target.value})}
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Minimum Guests</label>
                  <input
                    type="number"
                    class="form-control"
                    required
                    value={this.state.newUnitType.minGuests || ''}
                    onChange={e => this.editUnitTypeInfo({minGuests: e.target.value})}
                  />
                </div>
                <div class="form-group">
                  <label>Maximum Guests</label>
                  <input
                    type="number"
                    class="form-control"
                    required
                    value={this.state.newUnitType.maxGuests || ''}
                    onChange={e => this.editUnitTypeInfo({maxGuests: e.target.value})}
                  />
                </div>
                <div class="form-group">
                  <label>Price</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Price per night, including taxes"
                      required
                      value={this.state.newUnitType.price || ''}
                      onChange={e => this.editUnitTypeInfo({price: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            ),
            addAmenity: (
              <div class="form-group">
                <label>Amenity Code</label>
                <input
                  type="number"
                  class="form-control"
                  required
                  value={this.props.amenityCode}
                  onChange={e => this.props.onAmenityCodeChange(e.target.value)}
                />
              </div>
            ),
            removeAmenity: (
              <div class="form-group">
                <label>Amenity to Remove</label>
                <Select
                  name="Amenity"
                  clearable={false}
                  value={this.props.amenityCode || this.props.amenities[0]}
                  autoFocus="true"
                  options={this.props.amenities.map((a)=>{return {value: a, label: a}})}
                  onChange={e => this.props.onAmenityCodeChange(e.value)}
                />
              </div>
            ),
            addImageUnitType: (
              <div>
                <div class="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    class="form-control"
                    value={this.state.image.imageUrl}
                    onChange={e => this.setState({ image: { imageUrl: e.target.value } })}
                  />
                </div>
                <div class="form-group">
                  <label>Preview</label>
                  <img class="img-fluid" src={this.state.image.imageUrl} />
                </div>
              </div>
            ),
            removeImageUnitType: (
              <div>
                <div class="form-group">
                  <label>Image to Remove</label>
                  <Select
                    name="Image"
                    clearable={false}
                    value={this.state.image.imageUrl || ''}
                    autoFocus="true"
                    options={this.props.hotel.unitTypes[this.props.unitType].images.map((url, i)=>{return {value: i, label: url}}).filter(e => e.label)}
                    onChange={e => this.setState({ image: { imageUrl: e.label, imageIndex: e.value } })}
                  />
                </div>
                <div class="form-group">
                  <label>Preview</label>
                  <img class="img-fluid" src={this.state.image.imageUrl} />
                </div>
              </div>
            ),
            removeUnitType: (
              <div class="form-group">
                <label>Enter your password below to remove this room type</label>
              </div>
            )
          }[this.props.editHotelUnitTypeFunction]}
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={this.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={this.state.password}
                required
                onChange={(event) => {
                  this.setState({ password: event.target.value, addHotelUnitTypeError: false });
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
          <button type="submit" class="btn btn-primary btn-block">Update Room Type</button>
        </form>
      );
    }

}
