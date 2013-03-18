

// Created: 03//2013

// image attribute class
// Keeps track of all information related to an individual image attribute
function imageAttribute(attribute_id) {

  // *******************************************
  // Private variables:
  // *******************************************

  this.id;
  this.attribute_name = '';
  this.attribute_value = '';
  this.username = 'anonymous';
  this.deleted = 0;
  this.verified = 0;
  this.attribute_id = attribute_id;
  this.div_attach = 'myCanvas_bg';
  this.CloseErrorFlag = 0;

  // *******************************************
  // Public methods:
  // *******************************************

  this.SetID = function(id) {
    this.id = id;
  };

  this.GetAttributeName = function () {
    return this.attribute_name;
  };

  this.SetAttributeName = function(name) {
    this.attribute_name = name;
  };

  this.GetAttributeValue = function () {
    return this.attribute_value;
  };

  this.SetAttributeValue = function(name) {
    this.attribute_value = name;
  };

  this.GetUsername = function () {
    return this.username;
  };

  this.SetUsername = function(u) {
    this.username = u;
  };

  this.GetDeleted = function () {
    return this.deleted;
  };

  this.SetDeleted = function(d) {
    this.deleted = d;
  };

  this.GetVerified = function () {
    return this.verified;
  };

  this.SetVerified = function (v) {
    this.verified = v;
  };

  this.SetDivAttach = function(da) {
    this.div_attach = da;
  };

  this.GetAttributeID = function () {
    return this.attribute_id;
  };
}
