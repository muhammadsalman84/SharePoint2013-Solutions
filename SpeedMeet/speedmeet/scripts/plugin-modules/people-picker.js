'use strict';

define(function () {
    function PeoplePicker() {
        var self = this;

        // Render and initialize the client-side People Picker.
        self.initializePeoplePicker = function (peoplePickerElementId) {

            // Create a schema to store picker properties, and set the properties.
            var schema = {};
            schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
            schema['SearchPrincipalSource'] = 15;
            schema['ResolvePrincipalSource'] = 15;
            schema['AllowMultipleValues'] = true;
            schema['MaximumEntitySuggestions'] = 50;
            schema['Width'] = '280px';

            // Render and initialize the picker. 
            // Pass the ID of the DOM element that contains the picker, an array of initial
            // PickerEntity objects to set the picker value, and a schema that defines
            // picker properties.
            SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
        }

        self.initializePeoplePicker('peoplePickerDiv');

        self.getParticipants = function () {
            var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;

            // Get information about all users.
            var users = peoplePicker.GetAllUserInfo();
            var usersArray = [];
            for (var i = 0; i < users.length; i++) {
                var user = users[i];                
                usersArray.push(user.Key.replace('i:0#.w|', ''));
            }
            return usersArray;
        }
        self.clearPeoplePicker = function(){
            var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;
            var usersobject = peoplePicker.GetAllUserInfo();
            usersobject.forEach(function (index) {
                peoplePicker.DeleteProcessedUser(usersobject[index]);
            });
        }

        self.setPeoplePicker = function (userKeys) {
            var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;
            peoplePicker.AddUserKeys(userKeys);
           
        }

    }

    return PeoplePicker;
});