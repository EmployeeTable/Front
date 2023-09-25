
$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: 'https://localhost:44381/api/Employee',
        contentType: "application/json",
        dataType: 'json',
        success: function (data) {
            var tableBody = $('#employeeTable tbody');
            $.each(data, function (index, employee) {
                var row = $('<tr>');
              
                row.attr('data-id', employee.id);
                row.append($('<td>').text(employee.name));
                row.append($('<td>').text(employee.age));


                var addressesList = $('<ul>');
                $.each(employee.addresses, function (i, address) {
                    addressesList.append($('<li>').text(address.description));
                });

                var addressesCell = $('<td>').append(addressesList);
                row.append(addressesCell);

                // Create Edit and Delete buttons
                var editButton = $('<button>').text('Edit');
                var deleteButton = $('<button>').text('Delete');

                // Attach click event handlers to buttons
                editButton.click(function () {
                    editEmployee(employee);
                });

                deleteButton.click(function () {
                    // Show a SweetAlert2 confirmation dialog
                    Swal.fire({
                        title: 'Confirm Delete',
                        text: 'Are you sure you want to delete this employee?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Delete'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            deleteEmployee(employee.id);
                        }
                    });
                });

                // Add buttons to a cell in the row
                var actionsCell = $('<td>').append(editButton).append(deleteButton);
                row.append(actionsCell);


                tableBody.append(row);
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(xhr.responseText);
        }
    });

    // Function to handle adding new address input fields
    $('#addAddressButton').click(function () {
        var addressInput = $('<input type="text" name="addresses" placeholder="New Address">');
        $('#editAddressesContainer').append(addressInput);
    });

    $('#cancelbutton').click(function () {  
        $('#editForm').hide();
        reset();
    });
    
    $('#add').click(function () {  
        $('#editForm').show();
    });

    // Function to handle the edit button click
    function editEmployee(employeeData) {
        console.log(employeeData)
        $('#editEmployeeId').val(employeeData.id);
        $('#editName').val(employeeData.name);
        $('#editAge').val(employeeData.age);

        // Clear existing address input fields
        $('#editAddressesContainer').empty();

        // Populate address input fields
        $.each(employeeData.addresses, function (i, address) {
            var addressInput = $('<input type="text" name="addresses">').val(address.description);
            $('#editAddressesContainer').append(addressInput);
        });

        $('#editForm').show(); 
    }


    $('#employeeEditForm').submit(function (e) {
        e.preventDefault();
    
        var employeeId = $('#editEmployeeId').val(); 
  
        var addresses = [];
        $('#editAddressesContainer input[name="addresses"]').each(function () {
            var description = $(this).val();
            addresses.push({ description: description });
        });
    
        
        var employeeData = {
            id: employeeId,
            name: $('#editName').val(),
            age: $('#editAge').val(),
            addresses: addresses
        };
    
        // Check if the employee Id exists in the database
        if (employeeId) {
            // If employeeId exists
            $.ajax({
                type: 'PUT',
                url: 'https://localhost:44381/api/Employee/' + employeeData.id,
                contentType: "application/json",
                data: JSON.stringify(employeeData),
                success: function (response) {
                    reset();
                    updateTableRow(response);
                    console.log(response);
                },
                error: function (xhr, textStatus, errorThrown) {
                   
                    if (xhr.status === 400) {
                        
                        var validationResponse = JSON.parse(xhr.responseText);
                        if (validationResponse && validationResponse.errors) {
                          
                            $.each(validationResponse.errors, function (fieldName, errorMessages) {
                                var errorMessage = errorMessages.join(', '); 
                                var $errorSpan = $('#editForm').find('input[name="' + fieldName + '"] + .error-message');
                                $errorSpan.text(errorMessage).show(); 
                            });
                        } else {
                          
                            alert('Validation errors: Unexpected format');
                        }
                    } else {
                        console.error('Error:', xhr.responseText);
                    }
                }})}
            
            else {
            // If employeeId is not set
            employeeData.id=0
            $.ajax({
                type: 'POST',
                url: 'https://localhost:44381/api/Employee',
                contentType: "application/json",
                data: JSON.stringify(employeeData),
                success: function (response) {
                    reset();
                   
                    addEmployeeToTable(response); 
                 
                    console.log(response);
                },
                error: function (xhr, textStatus, errorThrown) {
                    if (xhr.status === 400) {
                        // Handle validation errors
                        var validationResponse = JSON.parse(xhr.responseText);
                        if (validationResponse && validationResponse.errors) {
                           
                            $.each(validationResponse.errors, function (fieldName, errorMessages) {
                                var errorMessage = errorMessages.join(', '); 
                                var $errorSpan = $('#editForm').find('input[name="' + fieldName + '"] + .error-message');
                                $errorSpan.text(errorMessage).show(); 
                            });
                        } else {
                           
                            alert('Validation errors: Unexpected format');
                        }
                    } else {
                        console.error('Error:', xhr.responseText);
                    }
                }
            });
        }
    });

     // Function to add a new employee to the table
     function addEmployeeToTable(employeeData) {
       
        var newRow = $('<tr>');
        
        newRow.append($('<td>').text(employeeData.name));
        newRow.append($('<td>').text(employeeData.age));

        var addressesList = $('<ul>');
        $.each(employeeData.addresses, function (i, address) {
            addressesList.append($('<li>').text(address.description));
        });

        var addressesCell = $('<td>').append(addressesList);
        newRow.append(addressesCell);

     
        var editButton = $('<button>').text('Edit');
        var deleteButton = $('<button>').text('Delete');

   
        editButton.click(function () {
            editEmployee(employeeData);
        });

        deleteButton.click(function () {
            deleteEmployee(employeeData.id);
        });


        var actionsCell = $('<td>').append(editButton).append(deleteButton);
        newRow.append(actionsCell);

        $('#employeeTable tbody').append(newRow);
    }
 

// Function to update the row in the table with the updated data
function updateTableRow(updatedEmployeeData) {
    console.log(updatedEmployeeData.id)
    var row = $('#employeeTable tbody').find('tr[data-id="' + updatedEmployeeData.id + '"]');
    console.log(row)
    if (row.length > 0) {
        row.find('td:eq(0)').text(updatedEmployeeData.name);
        row.find('td:eq(1)').text(updatedEmployeeData.age);
        var addressesList = $('<ul>');
        $.each(updatedEmployeeData.addresses, function (i, address) {
            addressesList.append($('<li>').text(address.description));
        });
        row.find('td:eq(2)').empty().append(addressesList); // Clear and update the addresses cell
    }
}
function deleteEmployee(employeeId) {
  
        $.ajax({
            type: 'DELETE',
            url: 'https://localhost:44381/api/Employee/' + employeeId,
            success: function () {
            
                $('#employeeTable tbody').find('tr[data-id="' + employeeId + '"]').remove();
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error('Error:', xhr.responseText);
            }
        });
    }


function reset(){
    $('#editForm').hide(); 
    $('#editName').val('');
    $('#editAge').val('');
    $('#editAddressesContainer').empty();
    $('.error-message').text('').hide();
 } 
 

 
});

