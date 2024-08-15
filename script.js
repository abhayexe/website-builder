let selectedElement = null;
let isPreviewMode = false;

function addElement(type) {
    const element = document.createElement('div');
    element.className = `element ${type}`;
    element.id = generateUniqueId();
    element.style.left = '10px';
    element.style.top = '10px';

    switch (type) {
        case 'text':
            element.textContent = 'Double-click to edit';
            element.contentEditable = true;
            break;
        case 'image':
            const img = document.createElement('img');
            img.src = 'https://via.placeholder.com/150';
            element.appendChild(img);
            break;
        case 'shape':
            element.style.width = '100px';
            element.style.height = '100px';
            element.style.backgroundColor = '#007bff';
            break;
    }

    element.addEventListener('mousedown', selectElement);
    element.addEventListener('dblclick', editElement);

    document.getElementById('canvas').appendChild(element);
    selectElement({ target: element }); // Select the newly added element
}

function selectElement(e) {
    if (isPreviewMode) return;
    selectedElement = e.target.closest('.element');
    const offsetX = e.clientX - selectedElement.offsetLeft;
    const offsetY = e.clientY - selectedElement.offsetTop;

    function moveElement(e) {
        selectedElement.style.left = (e.clientX - offsetX) + 'px';
        selectedElement.style.top = (e.clientY - offsetY) + 'px';
    }

    function stopMoving() {
        document.removeEventListener('mousemove', moveElement);
        document.removeEventListener('mouseup', stopMoving);
    }

    document.addEventListener('mousemove', moveElement);
    document.addEventListener('mouseup', stopMoving);

    updateSidebar();
}

function editElement(e) {
    if (e.target.className.includes('text')) {
        e.target.focus();
    }
}

function updateSidebar() {
    const properties = document.getElementById('properties');
    const additionalProperties = document.getElementById('additionalProperties');
    properties.innerHTML = '';
    additionalProperties.style.display = 'none';

    updateDeleteButton();

    if (selectedElement) {
        // Basic properties
        addProperty('width', selectedElement.style.width || '100px', 'text');
        addProperty('height', selectedElement.style.height || '100px', 'text');
        addProperty('backgroundColor', selectedElement.style.backgroundColor || '#ffffff', 'color');
        
        if (selectedElement.className.includes('text')) {
            addProperty('color', selectedElement.style.color || '#000000', 'color');
            addProperty('fontSize', selectedElement.style.fontSize || '16px', 'text');
            addProperty('fontWeight', selectedElement.style.fontWeight || 'normal', 'text');
            addProperty('fontFamily', selectedElement.style.fontFamily || 'Arial', 'select');
        }

        // Additional properties
        additionalProperties.style.display = 'block';
        
        updateAdditionalProperty('borderRadius', 'text');
        updateAdditionalProperty('boxShadow', 'text');
        updateAdditionalProperty('backgroundGradient', 'text');
        updateAdditionalProperty('border', 'text');
        updateAdditionalProperty('opacity', 'range');
        updateAdditionalProperty('blur', 'range');
        
        // Hover properties
        updateHoverProperty('color', 'hoverColor');
        updateHoverProperty('backgroundColor', 'hoverBackground');
    }
}

function addProperty(name, value, type) {
    const properties = document.getElementById('properties');
    const input = document.createElement(type === 'select' ? 'select' : 'input');
    input.type = type === 'select' ? '' : type;
    input.value = value;
    input.addEventListener('change', (e) => {
        selectedElement.style[name] = e.target.value;
    });

    const label = document.createElement('label');
    label.textContent = name + ': ';
    label.appendChild(input);

    if (type === 'select') {
        const options = ['Arial', 'Verdana', 'Times New Roman', 'Courier'];
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
        });
    }

    properties.appendChild(label);
}

function updateAdditionalProperty(property, inputType) {
    const input = document.getElementById(property);
    input.value = selectedElement.style[property] || '';
    input.oninput = (e) => {
        if (property === 'backgroundGradient') {
            selectedElement.style.background = e.target.value;
        } else if (property === 'blur') {
            selectedElement.style.filter = `blur(${e.target.value}px)`;
        } else {
            selectedElement.style[property] = e.target.value + (inputType === 'range' ? '' : 'px');
        }
    };
}

function updateHoverProperty(property, inputId) {
    const input = document.getElementById(inputId);
    const hoverStyle = document.createElement('style');
    document.head.appendChild(hoverStyle);
    
    input.oninput = (e) => {
        const elementId = selectedElement.id || `element-${Math.random().toString(36).substr(2, 9)}`;
        selectedElement.id = elementId;
        hoverStyle.innerHTML = `#${elementId}:hover { ${property}: ${e.target.value}; }`;
    };
}

function generateUniqueId() {
    return `element-${Math.random().toString(36).substr(2, 9)}`;
}

function deleteSelectedElement() {
    if (selectedElement) {
        selectedElement.remove();
        selectedElement = null;
        updateSidebar();
    }
}

function updateDeleteButton() {
    const deleteButton = document.getElementById('deleteElement');
    if (selectedElement) {
        deleteButton.style.display = 'block';
        deleteButton.onclick = deleteSelectedElement;
    } else {
        deleteButton.style.display = 'none';
    }
}

function togglePreview() {
    isPreviewMode = !isPreviewMode;
    document.body.classList.toggle('preview-mode');
    if (isPreviewMode) {
        selectedElement = null;
        updateSidebar();
        document.getElementById('deleteElement').style.display = 'none';
    }
}

document.getElementById('canvas').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        selectedElement = null;
        updateSidebar();
    }
});

document.getElementById('canvasBackgroundColor').addEventListener('change', (e) => {
    document.getElementById('canvas').style.backgroundColor = e.target.value;
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            addImageElement(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function addImageElement(src) {
    const element = document.createElement('div');
    element.className = 'element image';
    element.style.left = '10px';
    element.style.top = '10px';

    const img = document.createElement('img');
    img.src = src;
    element.appendChild(img);

    element.addEventListener('mousedown', selectElement);
    document.getElementById('canvas').appendChild(element);
    selectElement({ target: element }); // Select the newly added image
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedElement && !isPreviewMode) {
        deleteSelectedElement();
    }
});