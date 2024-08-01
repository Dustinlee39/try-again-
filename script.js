document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const toggleButton = document.getElementById('toggle-theme');
    const body = document.body;

    toggleButton.textContent = 'Toggle Theme';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    document.body.appendChild(toggleButton);

    toggleButton.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
    });

    const appLinks = document.querySelectorAll('nav ul li a');
    appLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const appId = link.dataset.app;
            openApp(appId, link.textContent);
        });
    });

    let zIndexCounter = 1000;

    function createWindow(appId, title, content) {
        const windowElement = document.createElement('div');
        windowElement.classList.add('window');
        windowElement.dataset.appId = appId;

        const windowTitleBar = document.createElement('div');
        windowTitleBar.classList.add('title-bar');
        windowTitleBar.innerHTML = `
            <span class="title">${title}</span>
            <div class="window-controls">
                <button class="minimize">-</button>
                <button class="maximize">[]</button>
                <button class="close">X</button>
            </div>
        `;
        windowElement.appendChild(windowTitleBar);

        const windowContent = document.createElement('div');
        windowContent.classList.add('content');
        windowContent.innerHTML = content;
        windowElement.appendChild(windowContent);

        desktop.appendChild(windowElement);
        bringToFront(windowElement);

        const taskbarItem = document.createElement('div');
        taskbarItem.classList.add('taskbar-item');
        taskbarItem.dataset.appId = appId;
        taskbarItem.textContent = title;
        taskbar.appendChild(taskbarItem);

        taskbarItem.addEventListener('click', () => {
            if (windowElement.style.display === 'none') {
                windowElement.style.display = 'block';
            }
            bringToFront(windowElement);
        });

        windowTitleBar.querySelector('.minimize').addEventListener('click', () => {
            windowElement.style.display = 'none';
        });

        windowTitleBar.querySelector('.maximize').addEventListener('click', () => {
            if (windowElement.classList.contains('maximized')) {
                windowElement.classList.remove('maximized');
            } else {
                windowElement.classList.add('maximized');
            }
        });

        windowTitleBar.querySelector('.close').addEventListener('click', () => {
            windowElement.remove();
            taskbarItem.remove();
        });

        windowTitleBar.addEventListener('mousedown', (event) => {
            const shiftX = event.clientX - windowElement.getBoundingClientRect().left;
            const shiftY = event.clientY - windowElement.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                windowElement.style.left = pageX - shiftX + 'px';
                windowElement.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
                windowElement.onmouseup = null;
            });

            windowElement.ondragstart = () => false;
        });

        windowElement.style.zIndex = zIndexCounter++;
    }

    function bringToFront(element) {
        const highestZIndex = Math.max(...Array.from(document.querySelectorAll('.window')).map(el => parseInt(el.style.zIndex || 0)));
        element.style.zIndex = highestZIndex + 1;
    }

    function openApp(appId, title) {
        if (!document.querySelector(`.window[data-app-id="${appId}"]`)) {
            createWindow(appId, title, `<p>Welcome to the ${title} app!</p>`);
        } else {
            const windowElement = document.querySelector(`.window[data-app-id="${appId}"]`);
            windowElement.style.display = 'block';
            bringToFront(windowElement);
        }
    }

    async function loadContent(appId) {
        try {
            const response = await fetch(`${appId}.html`);
            const content = await response.text();
            return content;
        } catch (error) {
            return `<p>Error loading content for ${appId}</p>`;
        }
    }

    appLinks.forEach(link => {
        link.addEventListener('click', async function(event) {
            event.preventDefault();
            const appId = link.dataset.app;
            const title = link.textContent;
            let content = await loadContent(appId);
            openApp(appId, title, content);
        });
    });

    openApp('home', 'Home');
    openApp('about', 'About');
});
