var request = require('request');
//var handler = require('./handle-response');
// var postContact = function (token, unformattedContact) {

//   //lifecycle_stage_id

//   var _account = unformattedContact.data.contact.sales_account_ids;
//   if (_account.length > 0) {
//     var test = { data: _account };
//     console.log(JSON.stringify(test));
//     var options = {
//       'method': 'POST',
//       'url': _BASE_MSCRM_URL+'/api/data/v9.1/contacts',
//       'headers': {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token
//       },
//       body: JSON.stringify({
//         "firstname": unformattedContact.data.contact.first_name.value,
//         "lastname": unformattedContact.data.contact.last_name.value
//       })

//     };
//     request(options, function (error, response) {
//       if (error) throw new Error(error);
//       console.log(response.body);
//     });
//   }
// }

var _BASE_MSCRM_URL = 'https://elgi.crm8.dynamics.com';//https://elgi-dev.crm8.dynamics.com';
var _BASE_FWCRM_URL = 'https://elgiequipmentslimited-team.myfreshworks.com';//'https://elgi-staging.myfreshworks.com';
var _LIFECYCLE_STAGE_ID = 71003167534;//71003299798; // QUALIFIED
var _TOKEN = 'ZH6f1KjvcwvFUvNI4j3Jsw';//'QawXSH7n3WFmf8xt2WA9Pg';
var checkIfContactExists = function (token, mobile, email, callback) {
  var options = {
    'method': 'GET',
    'url': _BASE_MSCRM_URL + '/api/data/v9.1/contacts?fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">  <entity name="contact">    <attribute name="contactid" />    <attribute name="parentcustomerid" />    <order attribute="parentcustomerid" descending="false" />    <filter type="and">      <filter type="or">        <condition attribute="mobilephone" operator="eq" value="' + mobile + '" />        <condition attribute="emailaddress1" operator="eq" value="' + email + '" />      </filter>    </filter>  </entity></fetch>',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  request(options, function (error, response) {
    if (error) {
      console.log('ERR' + JSON.stringify(error));
    } else {
      var _val = JSON.parse(response.body).value
      if (_val.length > 0) {
        callback({
          contactid: _val[0].contactid,
          accountid: _val[0]._parentcustomerid_value
        });
      } else {
        callback({});
      }
    }

  });

}

var getCRMOwner = function (token, fwuserid, callback) {
  //console.log('inside get Owner ' + fwuserid)
  if (fwuserid != null) {
    var options1 = {
      'method': 'GET',
      'url': _BASE_FWCRM_URL + '/crm/sales/api/contacts/' + fwuserid.toString() + '?include=sales_accounts,lifecycle_stage',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Token token=' + _TOKEN
      }
    };
    request(options1, function (error1, response1) {
      var _email = (JSON.parse(response1.body)).contact.email;
      //console.log('inside get Owner ' + _email)
      var options = {
        'method': 'GET',
        'url': _BASE_MSCRM_URL + '/api/data/v9.1/systemusers?fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false"><entity name="systemuser"><attribute name="systemuserid"/><order attribute="fullname" descending="false"/><filter type="and"><condition attribute="domainname" operator="eq" value="' + _email + '"/></filter></entity></fetch>',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      request(options, function (error, response) {
        if (error) {
          console.log('ERR' + JSON.stringify(error));
        } else {
          var _val = JSON.parse(response.body).value
          if (_val.length > 0) {
            callback(_val[0].systemuserid);
          } else {
            callback("");
          }
        }

      });

    });
  } else {
    callback("");
  }
}

var createAccount = function (token, fwaccountid, zip, callback) {
console.log('inside create account ' + fwaccountid+" "+zip) 
  var options1 = {
    'method': 'GET',
    'url': _BASE_MSCRM_URL + '/api/data/v9.1/accounts?fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">  <entity name="account">    <attribute name="name" />    <attribute name="primarycontactid" />    <attribute name="telephone1" />    <attribute name="accountid" />    <order attribute="name" descending="false" />    <filter type="and">      <condition attribute="elgi_fwcrmid" operator="eq" value="' + fwaccountid.toString() + '" />    </filter>  </entity></fetch>',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  request(options1, function (error1, response1) {
    if (error1) {
      console.log('ERR' + JSON.stringify(error1));
    } else {
      var _val = JSON.parse(response1.body).value
      if (_val.length > 0) {
        callback(_val[0].accountid);
      } else {


        var options2 = {
          'method': 'GET',
          'url': _BASE_FWCRM_URL + '/crm/sales/api/sales_accounts/' + fwaccountid.toString(),
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Token token=' + _TOKEN
          }
        };
        request(options2, function (error2, response2) {
          if (error2) throw new Error(error2);
          var _salesAccount = (JSON.parse(response2.body)).sales_account;
          //var zipcode = "";

          console.log('Account Zip Code ' + _salesAccount.zipcode)
          if (_salesAccount.zipcode == null) {
            //zipcode = zip;
          }else{
            //zipcode = _salesAccount.zipcode;
          }

          // console.log(JSON.stringify({
          //   "name": _salesAccount.name,//unformattedContact.data.contact.first_name.value
          //   //"emailaddress1":_salesAccount.name,
          //   "address1_line1": _salesAccount.address,
          //   "telephone1": _salesAccount.phone,
          //   "websiteurl": _salesAccount.website,
          //   "elgi_fwcrmid": fwaccountid.toString(),
          //   "address1_postalcode": zipcode
          // })
          // );'
          
          
          callback(0);

          //COMMENTED ON 01-02-2013 AS PER DEEPAK REQUIREMENT
          // var options = {
          //   'method': 'POST',
          //   'url': _BASE_MSCRM_URL + '/api/data/v9.1/accounts',
          //   'headers': {
          //     'Content-Type': 'application/json',
          //     'Authorization': 'Bearer ' + token
          //   },
          //   body: JSON.stringify({
          //     "name": _salesAccount.name,//unformattedContact.data.contact.first_name.value
          //     //"emailaddress1":_salesAccount.name,
          //     "address1_line1": _salesAccount.address,
          //     "telephone1": _salesAccount.phone,
          //     "websiteurl": _salesAccount.website,
          //     "elgi_fwcrmid": fwaccountid.toString(),
          //     "address1_postalcode": zipcode
          //   })

          // };
          // request(options, function (error, response) {
          //   if (error) {
          //     console.log('ERR' + JSON.stringify(error));
          //   } else {
          //     callback(response.headers['odata-entityid'].replace(_BASE_MSCRM_URL + '/api/data/v9.1/accounts(', '').replace(')', ''));
          //   }
          // });

        });

      }
    }

  });




}

var getContactJSON = function (mscrmaccid, unformattedContact, _email_1) {
  if (mscrmaccid == 0 || mscrmaccid === undefined) {
    return JSON.stringify({
      "firstname": unformattedContact.data.contact.first_name.value,
      "lastname": unformattedContact.data.contact.last_name.value,
      "emailaddress1": _email_1,
      "mobilephone": unformattedContact.data.contact.mobile_number.value,
      "elgi_fwcrmid": unformattedContact.data.contact.id.toString()
    })
  } else {
    return JSON.stringify({
      "firstname": unformattedContact.data.contact.first_name.value,
      "lastname": unformattedContact.data.contact.last_name.value,
      "emailaddress1": _email_1,
      "mobilephone": unformattedContact.data.contact.mobile_number.value,
      "parentcustomerid_account@odata.bind": "/accounts(" + mscrmaccid + ")",
      "elgi_fwcrmid": unformattedContact.data.contact.id.toString()
    })
  }
}

var createContact = function (token, unformattedContact, mscrmaccid, callback) {

  var _email = unformattedContact.data.contact.emails.value
  // 
  var _email_1 = "";
  if (_email.length > 0) {
    _email_1 = _email[0].email;
  }

  // console.log('CONTACT DATA'+JSON.stringify({
  //   "firstname": unformattedContact.data.contact.first_name.value,
  //   "lastname": unformattedContact.data.contact.last_name.value,
  //   "emailaddress2": _email_1,
  //   "mobilephone": unformattedContact.data.contact.mobile_number.value,
  //   "parentcustomerid_account@odata.bind": "/accounts(" + mscrmaccid + ")",
  //   "elgi_fwcrmid" : unformattedContact.data.contact.id.toString()
  // }));


  var options = {
    'method': 'POST',
    'url': _BASE_MSCRM_URL + '/api/data/v9.1/contacts',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: getContactJSON(mscrmaccid, unformattedContact, _email_1)

  };
  request(options, function (error, response) {
    if (error) {
      console.log('ERR' + JSON.stringify(error));
    } else {
      callback(response.headers['odata-entityid'].replace(_BASE_MSCRM_URL + '/api/data/v9.1/contacts(', '').replace(')', ''));
    }
  });
}

var getUnitOrSpares = function (strFwData) {
  if (strFwData == "Compressor") {
    return 585690000;
  } else {
    return 585690001;
  }
}
var getLeadJSON = function (mscrmaccid, mscrmownerid, mscrmcontid, _UnitSpares, _enqTitle, _enqDesc, _application, _fwcontactid) {
  if (mscrmownerid != "") {
    if (mscrmaccid == 0 || mscrmaccid === undefined) {
      return JSON.stringify({
        "parentcontactid@odata.bind": "/contacts(" + mscrmcontid + ")",
        "ownerid@odata.bind": "/systemusers(" + mscrmownerid + ")",
        "name": _enqTitle,
        "elgi_qualifyflag": true,
        "elgi_probability": 100000002,
        "elgi_sourceofenquiry": 100000001,
        "customerneed": _enqDesc,
        "elgi_businessvertical": 100000000,
        "elgi_enquirycategory": getUnitOrSpares(_UnitSpares),
        "statuscode": 100000003,
        "elgi_applicationofcompressedair": _application,
        "elgi_fwcrmid": _fwcontactid
      })
    } else {
      return JSON.stringify({
        "parentaccountid@odata.bind": "/accounts(" + mscrmaccid + ")",
        "parentcontactid@odata.bind": "/contacts(" + mscrmcontid + ")",
        "ownerid@odata.bind": "/systemusers(" + mscrmownerid + ")",
        "name": _enqTitle,
        "elgi_qualifyflag": true,
        "elgi_probability": 100000002,
        "elgi_sourceofenquiry": 100000001,
        "customerneed": _enqDesc,
        "elgi_businessvertical": 100000000,
        "elgi_enquirycategory": getUnitOrSpares(_UnitSpares),
        "statuscode": 100000003,
        "elgi_applicationofcompressedair": _application,
        "elgi_fwcrmid": _fwcontactid
      })
    }

  } else {

    if (mscrmaccid == 0 || mscrmaccid === undefined) {
      return JSON.stringify({
        "parentcontactid@odata.bind": "/contacts(" + mscrmcontid + ")",
        "name": _enqTitle,
        "elgi_qualifyflag": true,
        "elgi_probability": 100000002,
        "elgi_sourceofenquiry": 100000001,
        "customerneed": _enqDesc,
        "elgi_businessvertical": 100000000,
        "elgi_enquirycategory": getUnitOrSpares(_UnitSpares),
        "statuscode": 100000003,
        "elgi_applicationofcompressedair": _application
      })

    } else {
      return JSON.stringify({
        "parentaccountid@odata.bind": "/accounts(" + mscrmaccid + ")",
        "parentcontactid@odata.bind": "/contacts(" + mscrmcontid + ")",
        "name": _enqTitle,
        "elgi_qualifyflag": true,
        "elgi_probability": 100000002,
        "elgi_sourceofenquiry": 100000001,
        "customerneed": _enqDesc,
        "elgi_businessvertical": 100000000,
        "elgi_enquirycategory": getUnitOrSpares(_UnitSpares),
        "statuscode": 100000003,
        "elgi_applicationofcompressedair": _application
      })
    }
  }
}
var createLead = function (token, mscrmaccid, mscrmcontid, unformattedContact, callback) {

  //var _customFields = unformattedContact.data.contact.custom_field;

  var options1 = {
    'method': 'GET',
    'url': _BASE_FWCRM_URL + '/crm/sales/api/contacts/' + unformattedContact.data.contact.id.toString() + '?include=sales_accounts,lifecycle_stage',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Token token=' + _TOKEN
    }
  };
  request(options1, function (error1, response1) {
    var _customField = (JSON.parse(response1.body)).contact.custom_field;

    var _elgiOwnerIDinFW = _customField.cf_elgi_crm_owner;

    var _UnitSpares = _customField.cf_compressor__spares;
    var _enqDesc = "";
    var _enqTitle = "";
    var _application = "";
    if (_customField.cf_what_are_you_looking_for != null) {
      _enqDesc += 'Looking For : ' + _customField.cf_what_are_you_looking_for + '\n'
      _enqTitle += _customField.cf_what_are_you_looking_for
    }
    if (_customField.cf_industry != null) {
      _enqDesc += 'Industry : ' + _customField.cf_industry + '\n'
    }
    if (_customField.cf_parts_name__parts_number != null) {
      _enqDesc += 'Parts : ' + _customField.cf_parts_name__parts_number + '\n'
    }
    if (_customField.cf_product_inquiry != null) {
      _enqDesc += 'Product : ' + _customField.cf_product_inquiry + '\n'
      _enqTitle += "-" + _customField.cf_product_inquiry
    }
    if (_customField.cf_product_model != null) {
      _enqDesc += 'Model : ' + _customField.cf_product_model + '\n'
      _enqTitle += "-" + _customField.cf_product_model
    }
    if (_customField.cf_application_of_compressed_air != null) {
      _enqDesc += 'Application : ' + _customField.cf_application_of_compressed_air + '\n'

      _application = _customField.cf_application_of_compressed_air
    }
    if ((JSON.parse(response1.body)).contact.city != null) {
      _enqDesc += 'City : ' + (JSON.parse(response1.body)).contact.city + '\n'
    }
    if ((JSON.parse(response1.body)).contact.state != null) {
      _enqDesc += 'State : ' + (JSON.parse(response1.body)).contact.state + '\n'
    }
    if ((JSON.parse(response1.body)).contact.zipcode != null) {
      _enqDesc += 'Pincode : ' + (JSON.parse(response1.body)).contact.zipcode + '\n'
    }

    var elgi_fwcrmid = unformattedContact.data.contact.id.toString()

    if (_enqTitle == "") {
      _enqTitle = _enqDesc;
    }
    var _body = "";

    getCRMOwner(token, _elgiOwnerIDinFW, function (mscrmownerid) {

      //console.log('Owner GUID' + mscrmownerid)

      _body = getLeadJSON(mscrmaccid, mscrmownerid, mscrmcontid, _UnitSpares, _enqTitle, _enqDesc, _application, elgi_fwcrmid)
      //console.log(_body)

      var options = {
        'method': 'POST',
        'url': _BASE_MSCRM_URL + '/api/data/v9.1/opportunities',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: _body

      };
      request(options, function (error, response) {
        if (error) {
          console.log('ERR' + JSON.stringify(error));
        } else {
          callback(response.body);
        }
      });


    })




  });

  // var 
  // for(const _field of _customFields) {
  //   if(_field)
  //console.log('ENQ'+JSON.stringify({"tes":_customFields}));



}
exports = {

  // events: [
  //   { event: 'onContactUpdate', callback: 'onContactCreateHandler' }
  // ],

  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onContactCreateHandler: function (payload) {
    //var t = JSON.stringify(payload);
    // t= '';
    //console.log("Logging Init: ");
    var options = {
      'method': 'POST',
      'url': 'https://login.microsoftonline.com/elgi.onmicrosoft.com/oauth2/token',
      formData: {
        'grant_type': 'password',
        'client_id': '828669ab-13ab-4031-8aec-d73f9b66fb8e',
        'client_secret': 'XmY@jnadiAQTEH26-k0ak:6BeJ+PLwW=',
        'resource': _BASE_MSCRM_URL + '',
        'password': 'Cud43262#$',
        'username': 'servicereport@elgi.onmicrosoft.com'
      }
    };
    request(options, function (error, response) {
      if (error) {
        console.log('ERR' + JSON.stringify(error));
      } else {
        // console.log('key');
        // Object.keys(payload.data.contact).forEach(function (key) {
        //   //var val = o[key];
        //   //if(key.indexOf("custom_field") !== -1)
        //   console.log(key);
        // });

        //console.log('TOKEN ' + (JSON.parse(response.body)).access_token);
        var _atoken = (JSON.parse(response.body)).access_token;
        var _account = payload.data.contact.sales_account_ids;
        var _mobile = payload.data.contact.mobile_number.value
        var _email = payload.data.contact.emails.value
        var _zip = payload.data.contact.zipcode.value

        var lifecycle_stage_id = payload.data.contact.lifecycle_stage_id.value;
        // 
        var _islifecycleChanged = payload.data.changes.model_changes.lifecycle_stage_id;
        //console.log('changes' + JSON.stringify(payload.data));

        var _email_1 = "";
        if (_email.length > 0) {
          _email_1 = _email[0].email;
        }
        // console.log('_account[0] ' + _account[0]);
        // console.log('lifecycle_stage_id[0] ' + JSON.stringify(lifecycle_stage_id));
        if (_account.length > 0 && lifecycle_stage_id == _LIFECYCLE_STAGE_ID && _islifecycleChanged) {
          //ALL LOGIC HERE
          // console.log('account exists' );
          checkIfContactExists(_atoken, _mobile, _email_1, function (mscrmcontact) {
            //console.log('CONTACT IS EXISTS');
            if (Object.keys(mscrmcontact).length === 0) { // NO CONTACT IN MSCRM
              createAccount(_atoken, _account[0], _zip, function (mscrmaccid) {
                //console.log('ACCOUNT CREATED ' + mscrmaccid);
                createContact(_atoken, payload, mscrmaccid, function (mscrmcontid) {
                  //console.log('C CREATED ' + mscrmcontid);
                  //console.log(mscrmcontid);
                  createLead(_atoken, mscrmaccid, mscrmcontid, payload, function (mscmlead) {
                    console.log(mscmlead);
                  })
                })

              })
            } else { // CONTACT IN CRM
              createLead(_atoken, mscrmcontact.accountid, mscrmcontact.contactid, payload, function (mscmlead) {
                console.log(mscmlead); // elgi_fwcrmid
              })
            }

          })
        } else if (lifecycle_stage_id == _LIFECYCLE_STAGE_ID && _islifecycleChanged) {
          checkIfContactExists(_atoken, _mobile, _email_1, function (mscrmcontact) {
            //console.log('CONTACT IS EXISTS');
            if (Object.keys(mscrmcontact).length === 0) { // NO CONTACT IN MSCRM

              //console.log('ACCOUNT CREATED ' + mscrmaccid);
              createContact(_atoken, payload, 0, function (mscrmcontid) {
                //console.log('C CREATED ' + mscrmcontid);
                //console.log(mscrmcontid);
                createLead(_atoken, 0, mscrmcontid, payload, function (mscmlead) {
                  console.log(mscmlead);
                })
              })


            } else { // CONTACT IN CRM
              createLead(_atoken, mscrmcontact.accountid, mscrmcontact.contactid, payload, function (mscmlead) {
                console.log(mscmlead); // elgi_fwcrmid
              })
            }

          })
        }
        //postContact((JSON.parse(response.body)).access_token, payload)
      }
    });


  },


};

