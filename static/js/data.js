
document.getElementById('register-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const userExplain = document.getElementById('user_explain').value;
            const plugin = document.getElementById('plugin').value;

            fetch('/insert_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    user_explain: userExplain,
                    plugin: plugin
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                alert('Data inserted successfully!');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to insert data.');
            });
        });

        document.getElementById('toggle-update').addEventListener('click', function() {
            this.classList.toggle('active');
            const content = document.getElementById('update-result');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        document.getElementById('users-data').addEventListener('click', function() {
            this.classList.toggle('active');
            const container = document.getElementById('data-container');
            container.style.display = container.style.display === 'block' ? 'none' : 'block';

            if (container.style.display === 'block' && !container.dataset.loaded) {

                container.dataset.loaded = true;
            }
        });

document.getElementById('update-button').addEventListener('click', function() {

    const updateData = {
        id: document.getElementById('update-id').value,
        username: document.getElementById('update-username').value,
        password: document.getElementById('update-password').value,
        user_explain: document.getElementById('update-explain').value,
        plugin: document.getElementById('update-plugin').value
    };


    fetch('/update_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
            console.log(data);
            alert(data.message);
    })
    .catch(error => {
        console.error('请求失败:', error);
        alert(data.message);
    });
});


    const pagination = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
        data: []
    };


    document.getElementById('fetch-users').addEventListener('click', function() {
        fetch('/get-users')
            .then(response => response.text())
            .then(responseText => {
                const allUsers = JSON.parse(responseText);
                pagination.data = allUsers;
                pagination.totalItems = allUsers.length;
                pagination.totalPages = Math.ceil(allUsers.length / pagination.pageSize);

                renderTable();
                renderPaginationControls();
            })
            .catch(handleFetchError);
    });


    function renderTable() {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        const pageData = pagination.data.slice(start, end);

        const tableBody = document.querySelector('#users-table tbody');
        tableBody.innerHTML = '';

        pageData.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>
                    <span class="encrypted-password">${user.password}</span>
                    <button class="decrypt-btn"
                        data-password="${user.password}"
                        data-plugin="${user.plugin}">解密</button>
                </td>
                <td>${user.user_explain}</td>
                <td>${user.plugin}</td>
            `;
            tableBody.appendChild(row);
        });


        tableBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('decrypt-btn')) {
                handleDecrypt(e.target);
            }
        });
    }


    function renderPaginationControls() {
        document.getElementById('page-info').textContent =
            `第 ${pagination.currentPage} 页 / 共 ${pagination.totalPages} 页`;


        document.getElementById('prev-page').disabled = pagination.currentPage === 1;
        document.getElementById('next-page').disabled = pagination.currentPage === pagination.totalPages;
    }


    document.getElementById('pagination-controls').addEventListener('click', function(e) {
        if (e.target.id === 'prev-page') {
            pagination.currentPage = Math.max(1, pagination.currentPage - 1);
        } else if (e.target.id === 'next-page') {
            pagination.currentPage = Math.min(pagination.totalPages, pagination.currentPage + 1);
        } else if (e.target.id === 'jump-btn') {
            const targetPage = parseInt(document.getElementById('jump-page').value);
            if (targetPage >= 1 && targetPage <= pagination.totalPages) {
                pagination.currentPage = targetPage;
            }
        }

        renderTable();
        renderPaginationControls();
    });


    function handleDecrypt(button) {
        const encryptedPassword = button.dataset.password;
        const plugin = button.dataset.plugin;

        fetch('/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_password: encryptedPassword, plugin })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const span = button.previousElementSibling;
                span.textContent = data.decrypted_password;
                button.remove();
            } else {
                alert('解密失败: ' + data.message);
            }
        })
        .catch(error => console.error('解密错误:', error));
    }


    function handleFetchError(error) {
        console.error('获取数据失败:', error);
        alert('数据加载失败，请检查网络连接');
    }