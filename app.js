let currentEditingElement = null;
        const jsPlumbInstance = jsPlumb.getInstance();

        jsPlumbInstance.ready(() => {
            jsPlumbInstance.setContainer("canvas");
            jsPlumbInstance.importDefaults({
                Connector: ["Flowchart", { cornerRadius: 5 }],
                Endpoint: ["Dot", { radius: 5 }],
                PaintStyle: { stroke: "black", strokeWidth: 2 },
                EndpointStyle: { fill: "black" },
                ConnectionOverlays: [
                    ["Arrow", { location: 1, width: 10, length: 10, foldback: 0.8, paintStyle: { fill: "black" } }]
                ]
            });
        });

        function makeElementDraggable(element) {
            let offsetX = 0;
            let offsetY = 0;
            let isDragging = false;

            element.addEventListener("mousedown", (e) => {
                isDragging = true;
                offsetX = e.clientX - element.offsetLeft;
                offsetY = e.clientY - element.offsetTop;
                element.style.zIndex = "1000";
            });

            document.addEventListener("mousemove", (e) => {
                if (isDragging) {
                    const canvas = document.getElementById("canvas");
                    const canvasRect = canvas.getBoundingClientRect();

                    const x = Math.min(
                        Math.max(e.clientX - offsetX, 0),
                        canvasRect.width - element.offsetWidth
                    );
                    const y = Math.min(
                        Math.max(e.clientY - offsetY, 0),
                        canvasRect.height - element.offsetHeight
                    );

                    element.style.left = `${x}px`;
                    element.style.top = `${y}px`;

                    jsPlumbInstance.repaintEverything();
                }
            });

            document.addEventListener("mouseup", () => {
                if (isDragging) {
                    isDragging = false;
                    element.style.zIndex = "auto";
                }
            });
        }

        function openEditModalPanel(elementId) {
            currentEditingElement = document.getElementById(elementId);
            const titleContent = currentEditingElement.querySelector(".panel-title").innerText;
            const subtitleContent = currentEditingElement.querySelector(".panel-subtitle").innerText;
            const currentColor = currentEditingElement.querySelector(".drag-element").classList[0];
            document.getElementById("editTitleInput").value = titleContent;
            document.getElementById("editSubtitleInput").value = subtitleContent;
            document.getElementById("editColorInput").value = currentColor;
            Metro.dialog.open("#editModalPanel");
        }

        function saveChangesPanel() {
            const newTitle = document.getElementById("editTitleInput").value;
            const newSubtitle = document.getElementById("editSubtitleInput").value;
            const newColor = document.getElementById("editColorInput").value;
            if (currentEditingElement) {
                const titleElement = currentEditingElement.querySelector(".panel-title");
                const subtitleElement = currentEditingElement.querySelector(".panel-subtitle");
                titleElement.innerText = newTitle;
                subtitleElement.innerText = newSubtitle;
                const colorElement = currentEditingElement.querySelector(".drag-element");
                if (colorElement) {
                    colorElement.className = `${newColor} fg-white p-2 drag-element`;
                }
            }
            Metro.dialog.close("#editModalPanel");
        }

        function openEditModalText(elementId) {
            currentEditingElement = document.getElementById(elementId);
            const textContent = currentEditingElement.querySelector(".content").innerText;
            document.getElementById("editTextInput").value = textContent;
            Metro.dialog.open("#editModalText");
        }

        function saveChangesText() {
            const newText = document.getElementById("editTextInput").value;
            if (currentEditingElement) {
                currentEditingElement.querySelector(".content").innerText = newText;
            }
            Metro.dialog.close("#editModalText");
        }

        function openEditModalImage(elementId) {
            currentEditingElement = document.getElementById(elementId);
            const currentUrl = currentEditingElement.querySelector("img").src;
            document.getElementById("editImageUrlInput").value = currentUrl;
            Metro.dialog.open("#editModalImage");
        }

        function saveChangesImage() {
            const newUrl = document.getElementById("editImageUrlInput").value;
            if (currentEditingElement) {
                currentEditingElement.querySelector("img").src = newUrl;
            }
            Metro.dialog.close("#editModalImage");
        }

        function addPanel(x, y) {
            const panel = document.createElement("div");
            const uniqueId = `panel-${Date.now()}`;
            panel.className = "draggable w-25 resizeable";
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;
            panel.id = uniqueId;
            panel.innerHTML = `
                <div class="bg-cyan fg-white p-2 drag-element panel-title">Título del Panel</div>
                <div class="border bd-cyan p-2 panel-subtitle">Subtítulo del Panel</div>
                <div class="connection-point top"></div>
                <div class="connection-point bottom"></div>
            `;
            panel.addEventListener("dblclick", () => openEditModalPanel(uniqueId));
            document.getElementById("canvas").appendChild(panel);
            makeElementDraggable(panel);
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Top", isSource: true, isTarget: true });
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Bottom", isSource: true, isTarget: true });
            jsPlumbInstance.draggable(uniqueId, { containment: "parent" });
        }

        function addText(x, y, content) {
            const text = document.createElement("div");
            const uniqueId = `text-${Date.now()}`;
            text.className = "draggable";
            text.style.left = `${x}px`;
            text.style.top = `${y}px`;
            text.id = uniqueId;
            text.innerHTML = `
                <span class="content">${content}</span>
                <div class="connection-point top"></div>
                <div class="connection-point bottom"></div>
            `;
            text.addEventListener("dblclick", () => openEditModalText(uniqueId));
            document.getElementById("canvas").appendChild(text);
            makeElementDraggable(text);
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Top", isSource: true, isTarget: true });
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Bottom", isSource: true, isTarget: true });
            jsPlumbInstance.draggable(uniqueId, { containment: "parent" });
        }

        function addImage(x, y) {
            const img = document.createElement("div");
            const uniqueId = `img-${Date.now()}`;
            img.className = "draggable resizeable";
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
            img.id = uniqueId;
            img.innerHTML = `
                <img src="https://via.placeholder.com/150" style="width: 100%; height: auto;">
                <div class="connection-point top"></div>
                <div class="connection-point bottom"></div>
            `;
            img.addEventListener("dblclick", () => openEditModalImage(uniqueId));
            document.getElementById("canvas").appendChild(img);
            makeElementDraggable(img);
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Top", isSource: true, isTarget: true });
            jsPlumbInstance.addEndpoint(uniqueId, { anchor: "Bottom", isSource: true, isTarget: true });
            jsPlumbInstance.draggable(uniqueId, { containment: "parent" });
        }

        function clearCanvas() {
            jsPlumbInstance.reset();
            document.getElementById("canvas").innerHTML = "";
        }

        function exportCanvas() {
            const canvasElement = document.getElementById("canvas");
            html2canvas(canvasElement).then((canvas) => {
                const link = document.createElement("a");
                link.download = "pizarra.png";
                link.href = canvas.toDataURL();
                link.click();
            });
        }