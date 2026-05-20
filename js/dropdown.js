// Custom Dropdown Component
const Dropdown = {
    originalSelect: null,
    customDropdown: null,
    
    init() {
        this.originalSelect = document.getElementById('platformSelect');
        this.create();
    },
    
    create() {
        this.customDropdown = document.createElement('div');
        this.customDropdown.className = 'custom-dropdown';
        
        const button = this.createButton();
        const menu = this.createMenu();
        
        this.customDropdown.appendChild(button);
        this.customDropdown.appendChild(menu);
        
        // Replace original select
        this.originalSelect.parentNode.insertBefore(this.customDropdown, this.originalSelect);
        this.originalSelect.classList.add('hidden-select');
    },
    
    createButton() {
        const button = document.createElement('button');
        button.className = 'dropdown-button';
        button.type = 'button';
        
        const selectedValue = this.originalSelect.value;
        const selectedText = this.originalSelect.options[this.originalSelect.selectedIndex].text;
        
        button.innerHTML = `
            ${CONFIG.platforms[selectedValue].icon}
            <span class="selected-text">${selectedText}</span>
            <span class="arrow">▼</span>
        `;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.customDropdown.classList.toggle('active');
        });
        
        return button;
    },
    
    createMenu() {
        const menu = document.createElement('ul');
        menu.className = 'dropdown-menu';
        
        Array.from(this.originalSelect.options).forEach(option => {
            const li = document.createElement('li');
            li.className = 'dropdown-item';
            if (option.value === this.originalSelect.value) {
                li.classList.add('selected');
            }
            li.dataset.value = option.value;
            li.innerHTML = `
                ${CONFIG.platforms[option.value].icon}
                <span>${option.text}</span>
            `;
            
            li.addEventListener('click', () => {
                this.selectOption(option.value, option.text);
            });
            
            menu.appendChild(li);
        });
        
        return menu;
    },
    
    selectOption(value, text) {
        this.originalSelect.value = value;
        
        const button = this.customDropdown.querySelector('.dropdown-button');
        button.innerHTML = `
            ${CONFIG.platforms[value].icon}
            <span class="selected-text">${text}</span>
            <span class="arrow">▼</span>
        `;
        
        // Update selected state
        this.customDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.value === value) {
                item.classList.add('selected');
            }
        });
        
        this.customDropdown.classList.remove('active');
        this.originalSelect.dispatchEvent(new Event('change'));
    },
    
    getValue() {
        return this.originalSelect.value;
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (Dropdown.customDropdown && !Dropdown.customDropdown.contains(e.target)) {
        Dropdown.customDropdown.classList.remove('active');
    }
});