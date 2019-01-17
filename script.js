/* information about jsdocs: 
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
* 
/**
 * Listen for the document to load and initialize the application
 */
$(document).ready(initializeApp);

/**
 * Define all global variables here.  
 */
var student_map = new Map();
// var student_key = 0;

/***************************************************************************************************
* initializeApp 
* @params {undefined} none
* @returns: {undefined} none
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/
function initializeApp() {
    clearAddStudentFormInputs();
    addClickHandlersToElements();
    fetchDataFromServer();
}

/***************************************************************************************************
* addClickHandlerstoElements
* @params {undefined} 
* @returns  {undefined}
*     
*/
function addClickHandlersToElements() {
    $('.addButton').click(handleAddClicked);
    $('.cancelButton').click(handleCancelClick);
    $('.student-add-form').keydown(function (e) {
        var key = e.which;
        if (key == 13)
            $('.addButton').click();
    });
}
/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return: none
 * @calls: addStudent
 */
function handleAddClicked() {
    var name_input = $('#nameInput').val();
    var course_input = $('#courseInput').val();
    var grade_input = $('#gradeInput').val();

    var form_errors = { name: [], course: [], grade: [] };

    form_errors.name = isNameValid(name_input);
    form_errors.course = isCourseValid(course_input);
    form_errors.grade = isGradeValid(grade_input);

    if (form_errors.name.length === 0 && form_errors.course.length === 0 && form_errors.grade.length === 0) {
        var student = { name: name_input, course: course_input, grade: grade_input };
        pushDataToServer(student);
        clearAddStudentFormInputs();
        unrenderValidation();
    }
    else {
        renderValidation(form_errors);
    }

}
/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: clearAddStudentFormInputs
 */
function handleCancelClick() {
    clearAddStudentFormInputs();
}
/***************************************************************************************************
 * handleLoadClicked - Event Handler when user clicks the load button, should load data from server
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: none
 */
function handleLoadClick() {
    fetchDataFromServer();
}
/***************************************************************************************************
 * fetchDataFromServer - uses ajax call to fetch data from the lfz api server
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: none
 */
function fetchDataFromServer() {
    $.ajax({
        url: 'https://s-apis.learningfuze.com/sgt/get',
        method: 'POST',
        dataType: 'json',
        data: { "api_key": "TlvywFini5" },
        success: function (response) {
            if (!response.success) {
                let error_messages;
                (response.errors.length > 1) ? error_messages = response.errors.join(", ") : error_messages = response.errors[0];

                let fail_alert = `<div id="fetch-fail-alert" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oops!</strong> ${error_messages}.</div>`;
                $('#alerts').append(fail_alert);

                $("#fetch-fail-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#fetch-fail-alert").slideUp(500);
                });
            }
            else {
                var api_data = response.data;
                for (var i in api_data) {
                    var studentKey = api_data[i].id;
                    var studentObj = { name: api_data[i].name, course: api_data[i].course, grade: api_data[i].grade };
                    updateStudentList_Add(studentKey, studentObj);
                }

                let success_alert = '<div id="fetch-success-alert" class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> Student grade entries have been successfully loaded from the server.</div>';
                $('#alerts').append(success_alert);

                $("#fetch-success-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#fetch-success-alert").slideUp(500);
                });
            }
        },
        error: function (response) {
            $('#server-error-modal').modal('show');

            console.log('Server Error');
            console.log(response);
        }

    });
}
/***************************************************************************************************
 * pushDataToServer - uses ajax call to push data to server.
 * @param: studentObj {object}
 * @returns: {undefined} none
 * @calls: none
 */
function pushDataToServer(studentObj) {
    $.ajax({
        url: 'https://s-apis.learningfuze.com/sgt/create',
        method: 'POST',
        dataType: 'json',
        data: { "api_key": "TlvywFini5", "name": studentObj.name, "course": studentObj.course, "grade": parseInt(studentObj.grade) },
        success: function (response) {
            if (!response.success) {
                let error_messages;
                (response.errors.length > 1) ? error_messages = response.errors.join(", ") : error_messages = response.errors[0];

                let fail_alert = `<div id="add-fail-alert" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oops!</strong> ${error_messages}.</div>`;
                $('#alerts').append(fail_alert);

                $("#add-fail-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#add-fail-alert").slideUp(500);
                });
            }
            else {
                var studentKey = response.new_id;
                updateStudentList_Add(studentKey, studentObj);

                let success_alert = '<div id="add-success-alert" class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> Student grade entry has been successfully added.</div>';
                $('#alerts').append(success_alert);

                $("#add-success-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#add-success-alert").slideUp(500);
                });
            }
        },
        error: function (response) {
            $('#server-error-modal').modal('show');

            console.log('Server Error');
            console.log(response);
        }

    });
}
/***************************************************************************************************
 * deleteDataFromServer - uses ajax call to delete data from server.
 * @param: studentKey {number}
 * @returns: {undefined} none
 * @calls: none
 */
function deleteDataFromServer(studentKey) {
    $.ajax({
        url: 'https://s-apis.learningfuze.com/sgt/delete',
        method: 'POST',
        dataType: 'json',
        data: { "api_key": "TlvywFini5", "student_id": studentKey },
        success: function (response) {
            if (!response.success) {
                let error_messages;
                (response.errors.length > 1) ? error_messages = response.errors.join(", ") : error_messages = response.errors[0];

                let fail_alert = `<div id="delete-fail-alert" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oops!</strong> ${error_messages}.</div>`;
                $('#alerts').append(fail_alert);

                $("#delete-fail-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#delete-fail-alert").slideUp(500);
                });
            }
            else {
                updateStudentList_Delete(studentKey);

                let success_alert = '<div id="delete-success-alert" class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> Student grade entry has been successfully deleted.</div>';
                $('#alerts').append(success_alert);

                $("#delete-success-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#delete-success-alert").slideUp(500);
                });
            }
        },
        error: function (response) {
            $('#server-error-modal').modal('show');

            console.log('Server: Error');
            console.log(response);
        }

    });
}
/***************************************************************************************************
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentFormInputs() {
    $('#nameInput').val('');
    $('#courseInput').val('');
    $('#gradeInput').val('');
}
/***************************************************************************************************
 * renderStudentOnDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param {object} studentObj a single student object with course, name, and grade inside
 */
function renderStudentOnDom(studentKey, studentObject) {
    var student_name = $('<th>', { scope: 'row', text: studentObject.name });
    var student_course = $('<td>').text(studentObject.course);
    var student_grade = $('<td>').text(studentObject.grade);
    var delete_button = $('<td>').append($('<button>', { class: 'btn btn-danger', text: 'Delete', click: deleteClickEventHandler, id: studentKey }));

    var row = $('<tr>', { id: studentKey });
    row.append(student_name);
    row.append(student_course);
    row.append(student_grade);
    row.append(delete_button);

    $('.studentGradeEntries').append(row);
}
/***************************************************************************************************
 * updateStudentList_Add - centralized function to add student and update the average.
 * @param students {array} the array of student objects
 * @returns {undefined} none
 * @calls renderStudentOnDom, calculateGradeAverage, renderGradeAverage
 */
function updateStudentList_Add(studentKey, studentObject) {
    student_map.set(studentKey, studentObject);
    renderStudentOnDom(studentKey, studentObject);

    var newAvg = calculateGradeAverage();
    renderGradeAverage(newAvg);
}
/***************************************************************************************************
 * updateStudentList_Delete - centralized function to delete student and update the average.
 * @param student_name {string} the name of the student
 * @returns {undefined} none
 * @calls removeStudentOnDom, calculateGradeAverage, renderGradeAverage
 */
function updateStudentList_Delete(key) {
    removeStudentFromMap(key);
    removeStudentFromDom(key);

    var newAvg = calculateGradeAverage();
    renderGradeAverage(newAvg);
}
/***************************************************************************************************
 * calculateGradeAverage - loop through the global student array and calculate average grade and return that value
 * @param: {array} students  the array of student objects
 * @returns {number}
 */
function calculateGradeAverage() {
    var total = 0;
    for (var key of student_map.keys())
        total += parseInt(student_map.get(key).grade);
    return total / student_map.size;
}
/***************************************************************************************************
 * renderGradeAverage - updates the on-page grade average
 * @param: {number} average    the grade average
 * @returns {undefined} none
 */
function renderGradeAverage(avg) {
    var average = '' + Math.round(avg);
    $('.avgGrade').text(average);
}
/***************************************************************************************************
 * deleteClickEventHandler - deletes a student and updates the necessary data.
 * @param: {undefined} none
 * @returns {undefined} none
 */
function deleteClickEventHandler() {
    $('#delete-modal').modal('show');

    var deleteButton_id = $(event.currentTarget).attr('id'); // should be the same value as student key
    var studentKey = parseInt(deleteButton_id);

    $('#delete-confirmation').click(() => { deleteDataFromServer(studentKey); });
}
/***************************************************************************************************
 * removeStudentFromMap - deletes a student from the student map.
 * @param: key {string}
 * @returns {undefined} none
 */
function removeStudentFromMap(key) {
    student_map.delete(parseInt(key))
}
/***************************************************************************************************
 * removeStudentOnDom - removes student from the DOM.
 * @param: studentID {string}
 * @returns {undefined} none
 */
function removeStudentFromDom(key) {
    var student_entry = $('#' + key);
    student_entry.remove();
}
/***************************************************************************************************
 * isNameValid - alerts the user if name entry is invalid.
 * @param: name {string}
 * @returns errors {array}
 */
function isNameValid(name) {
    var errors = [];

    var number_regex = /\d/;
    var specialChars_regex = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;

    if (name.length < 2)
        errors.push('Must be a minimum of 2 letters.');

    if (number_regex.test(name) || specialChars_regex.test(name))
        errors.push('Must not contain any numbers or special characters.');

    return errors;
}
/***************************************************************************************************
 * isCourseValid - alerts the user if class entry is invalid.
 * @param: class {string}
 * @returns errors {array}
 */
function isCourseValid(course) {
    var errors = [];

    var specialChars_regex = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;

    if (course.length < 2)
        errors.push('Must be a minimum of 2 letters.');

    if (specialChars_regex.test(course))
        errors.push('Must not contain any special characters.');

    return errors;
}
/***************************************************************************************************
 * isGradeValid - alerts the user if grade entry is invalid.
 * @param: grade {string}
 * @returns errors {array}
 */
function isGradeValid(grade) {
    var errors = [];

    var specialChars_regex = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;
    var letters_regex = /[a-z]/;

    if (isNaN(grade) || letters_regex.test(grade) || specialChars_regex.test(grade))
        errors.push('Must be a number.');
    else if (grade < 0 || grade > 100)
        errors.push('Must be within range: 0-100.');
    else if (grade.length === 0)
        errors.push('Must enter a number between 0-100.');

    return errors;
}
/***************************************************************************************************
 * printMap - prints all keys & values in the console.
 * @param: {undefined} none
 * @returns {undefined} none
 */
function printMap() {
    if (student_map.size > 0) {
        for (var [key, value] of student_map)
            console.log(key + ': ' + '[' + value.name + ', ' + value.course + ', ' + value.grade + ']');
        console.log('\n');
    }
    else
        console.log('map is empty...\n');
}
/***************************************************************************************************
 * printLastElementInMap - prints the last element in the map.
 * @param: {undefined} none
 * @returns {undefined} none
 */
function printLastElementInMap() {
    var lastStudent = Array.from(student_map)[student_map.size - 1];
    console.log(lastStudent[0] + ': ' + '[' + lastStudent[1].name + ', ' + lastStudent[1].course + ', ' + lastStudent[1].grade + ']');
}
/***************************************************************************************************
 * renderValidation - renders client-side form validation.
 * @param: errors {array}
 * @returns {undefined} none
 */
function renderValidation(errors) {

    if (errors.name.length > 0) {
        var str = errors.name.join();
        var res = str.replace(',', '<br>');
        $('#name.form-group').addClass('has-error');
        $('#name.form-group > #helpBlock').html(res);
    }
    else {
        $('#name.form-group').addClass('has-success');
        $('#name.form-group > #helpBlock').text("Valid");
    }

    if (errors.course.length > 0) {
        var str = errors.course.join();
        var res = str.replace(',', '<br>');
        $('#course.form-group').addClass('has-error');
        $('#course.form-group > #helpBlock').html(res);
    }
    else {
        $('#course.form-group').addClass('has-success');
        $('#course.form-group > #helpBlock').text("Valid");
    }

    if (errors.grade.length > 0) {
        var str = errors.grade.join();
        var res = str.replace(',', '<br>');
        $('#grade.form-group').addClass('has-error');
        $('#grade.form-group > #helpBlock').html(res);
    }
    else {
        $('#grade.form-group').addClass('has-success');
        $('#grade.form-group > #helpBlock').text("Valid");
    }
}
/***************************************************************************************************
 * unrenderValidation - removes validation class for form inputs.
 * @param: {undefined} none
 * @returns {undefined} none
 */
function unrenderValidation() {

    $('#name.form-group').removeClass('has-error');
    $('#course.form-group').removeClass('has-error');
    $('#grade.form-group').removeClass('has-error');

    $('#name.form-group').removeClass('has-success');
    $('#course.form-group').removeClass('has-success');
    $('#grade.form-group').removeClass('has-success');
}