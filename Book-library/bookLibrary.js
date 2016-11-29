function attachEvents() {
    const usersUrl = `https://baas.kinvey.com/user/kid_Hk4Mh_tGx`
    const appUrl = `https://baas.kinvey.com/appdata/kid_Hk4Mh_tGx/books`
    const usersAuthorizationToken = `Basic a2lkX0hrNE1oX3RHeDo5NzRjYjdhMWZlNjk0ODZiOWQzZTFkYmM0Y2I1ZmNhOA==`
    let isLoggedIn = false
    viewLinks()

    $('#linkHome').on('click', () => {
        showHideViews('#viewHome')
    })

    $('#linkRegister').on('click', () => {
        showHideViews('#viewRegister')
    })

    $('#linkLogin').on('click', () => {
        showHideViews('#viewLogin')
    })

    $('#linkListBooks').on('click', () => {
        showHideViews('#viewBooks')
        listBooks()
    })

    $('#linkCreateBook').on('click', () => {
        showHideViews('#viewCreateBook')
    })

    $('#linkLogout').on('click', () => {
        logout()
    })

    $('#buttonLoginUser').on('click', (event) => {
        event.preventDefault()
        registerLogin('Login')
    })

    $('#buttonRegisterUser').on('click', (event) => {
        event.preventDefault()
        registerLogin('Register')
    })

    $('#buttonCreateBook').on('click', (event) => {
        event.preventDefault()
        createEditBook('Create')
    })

    $('#buttonEditBook').on('click', (event) => {
        event.preventDefault()
        let id = $('#formEditBook [name = "id"]').attr('data-id')
        createEditBook('Edit', id)
    })

    $('#errorBox').on('click', () => {
        $('#errorBox').fadeOut(1000)
    })

    function showHideViews(view) {
        $('section').hide()
        $(view).show()
    }

    function viewLinks() {
        if (isLoggedIn) {
            $('#linkHome').show()
            $('#linkLogout').show()
            $('#linkCreateBook').show()
            $('#linkRegister').hide()
            $('#linkListBooks').show()
            $('#linkLogin').hide()
        } else {
            $('#linkHome').show()
            $('#linkLogout').hide()
            $('#linkCreateBook').hide()
            $('#linkRegister').show()
            $('#linkListBooks').hide()
            $('#linkLogin').show()
        }
    }

    function login() {
        let username = $('#formLogin [name="username"]').val()
        let pass = $('#formLogin [name="passwd"]')
    }

    function registerLoginData(action) {
        let username = $(`#form${action} [name="username"]`).val()
        let password = $(`#form${action} [name="passwd"]`).val()
        return {
            username,
            password
        }
    }

    function registerLogin(action) {
        let data = registerLoginData(action)
        let loginToken = ''
        if (action == 'Login') {
            loginToken = '/login'
        }
        let requestObject = {
            url: usersUrl + loginToken,
            method: 'POST',
            headers: {
                Authorization: usersAuthorizationToken,
                "content-type": 'application/json'
            },
            data: JSON.stringify(data)
        }

        $.ajax(requestObject)
            .then((data) => {
                let actions = [
                    $('#formRegister [name="username"]').val(''),
                    $('#formRegister [name="passwd"]').val(''),
                    sessionStorage.setItem('username', data.username),
                    sessionStorage.setItem('authtoken', data._kmd.authtoken),
                    sessionStorage.setItem('creator_id', data._id),
                    showHideViews('#viewHome'),
                    showInfoMessage(`${action} successful.`),
                    isLoggedIn = true,
                    viewLinks()
                ]
                Promise.all(actions)
            })
            .catch(showErrorMessage(`${action} failed!`))
    }

    function logout() {
        let requestObject = {
            url: usersUrl + '/_logout',
            method: 'POST',
            headers: {
                Authorization: `Kinvey ${sessionStorage.getItem('authtoken')}`
            }
        }

        $.ajax(requestObject)
            .then(() => {
                let actions = [
                    sessionStorage.clear(),
                    isLoggedIn = false,
                    showHideViews('#viewLogin'),
                    viewLinks(),
                    showInfoMessage('Logout successful.')
                ]
                Promise.all(actions)
            })
            .catch(showErrorMessage('Logout failed!'))
    }

    function getCreateUpdateData(action) {
        let title = $(`#form${action}Book [name = "title"]`).val()
        let author = $(`#form${action}Book [name = "author"]`).val()
        let description = $(`#form${action}Book [name = "descr"]`).val()

        $(`#form${action}Book [name = "title"]`).val('')
        $(`#form${action}Book [name = "author"]`).val('')
        $(`#form${action}Book [name = "descr"]`).val('')

        return {
            title,
            author,
            description
        }
    }

    function createEditBook(action, dataId) {
        let data = getCreateUpdateData(action)
        let method = 'POST'
        let id = ''
        if (action == 'Edit') {
            method = 'PUT'
            id = `/${dataId}`
        }

        let requestObject = {
            method,
            url: appUrl + id,
            headers: {
                Authorization: `Kinvey ${sessionStorage.getItem('authtoken')}`,
                "content-type": 'application/json'
            },
            data: JSON.stringify(data)
        }

        $.ajax(requestObject)
            .then(() => {
                let actions = [
                    listBooks(),
                    showHideViews('#viewBooks'),
                    showInfoMessage(`The book was ${action.toLowerCase()}ed successfully!`)
                ]
                Promise.all(actions)
            })
            .catch((err) => {
                showInfoMessage(`Error: ${err.statusText}`)
            })
    }

    function listBooks() {
        let requestObject = {
            url: appUrl,
            headers: {
                Authorization: `Kinvey ${sessionStorage.getItem('authtoken')}`,
                "content-type": `application/json`
            }
        }

        $.ajax(requestObject)
            .then((data) => {
                displayBooks(data)
            })
            .catch((error) => {
                showInfoMessage(`Error: ${error.statusText}`)
            })
    }

    function displayBooks(data) {
        let tableHeaders = $(`<tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>`)
        $('#books').find('tbody').empty()
        $('#books').find('tbody').append(tableHeaders)
        let links = []
        for (let obj of data) {
            if (obj._acl.creator == sessionStorage.getItem('creator_id')) {
                let deleteLink = $('<a href="#">[Delete]</a>').on('click', () => {
                    deleteBook(obj._id)
                })
                let editLink = $('<a href="#">[Edit]</a>').on('click', () => {
                    getUpdateData(obj._id)
                })
                links = [deleteLink, ' ', editLink]
            }
            let row = $('<tr>')
                .append($('<td>').text(obj.title))
                .append($('<td>').text(obj.author))
                .append($('<td>').text(obj.description))
                .append($('<td>')
                    .append(links[0])
                    .append(links[1])
                    .append(links[2]))
            $('#books').find('tbody').append(row)
        }
    }

    function deleteBook(id) {
        let requestObject = {
            url: appUrl + `/${id}`,
            method: 'DELETE',
            headers: {
                Authorization: `Kinvey ${sessionStorage.getItem('authtoken')}`
            },
            success: () => {
                listBooks()
                showInfoMessage('Deleted.')
            },
            error: (error) => {
                showErrorMessage(`Error: ${error.statusText}`)
            }
        }

        $.ajax(requestObject)
    }

    function getUpdateData(id) {
        let requestObject = {
            url: appUrl + `?query={"_id":"${id}"}`,
            headers: {
                Authorization: `Kinvey ${sessionStorage.getItem('authtoken')}`
            }
        }

        $.ajax(requestObject)
            .then((data) => {
                updateForm(data[0])
            })
            .catch((error) => {
                console.log(error)
            })
    }

    function updateForm(book) {
        let actions = [
            showHideViews('#viewEditBook'),
            $('#formEditBook [name = "id"]').attr('data-id', book._id),
            $('#formEditBook [name = "title"]').val(book.title),
            $('#formEditBook [name = "author"]').val(book.author),
            $('#formEditBook [name = "descr"]').val(book.description)
        ]
        Promise.all(actions)
    }

    function showInfoMessage(message) {
        $('#infoBox').text(message)
        $('#infoBox').show()
        setTimeout(() => {
            $('#infoBox').fadeOut(1000)
        }, 3000)
    }

    function showErrorMessage(message) {
        $('#errorBox').text(message)
        $('#errorBox').show()
    }

    $(document).on({
        ajaxStart: () => {
            $("#loadingBox").show()
        },
        ajaxStop: () => {
            $("#loadingBox").hide()
        }
    })
}