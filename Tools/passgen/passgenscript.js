document.addEventListener('DOMContentLoaded', () => {
    const lengthRange = document.getElementById('passwordLength');
    const lengthDisplay = document.getElementById('lengthDisplay');
    const includeUppercase = document.getElementById('includeUppercase');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSymbols = document.getElementById('includeSymbols');
    const customSymbols = document.getElementById('customSymbols');
    const generateBtn = document.getElementById('generateBtn');
    const passwordOutput = document.getElementById('passwordOutput');
    const copyBtn = document.getElementById('copyBtn');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    const CHARS = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*()-_+=[]{}|;:,.<>/?`~'
    };

    function resetOptions() {
        lengthRange.value = 16;
        lengthDisplay.value = 16;
        
        includeUppercase.checked = true;
        includeLowercase.checked = true;
        includeNumbers.checked = true;
        includeSymbols.checked = true;
        customSymbols.value = '';
    }

    function getRandomChar(charSet) {
        if (!charSet || charSet.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * charSet.length);
        return charSet[randomIndex];
    }

    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    function generatePassword() {
        const length = parseInt(lengthRange.value);
        let characters = '';
        let ensuredChars = [];
        let characterPool = new Set();
        
        const buildPool = (set, isChecked, charSet) => {
            if (isChecked && charSet.length > 0) {
                ensuredChars.push(getRandomChar(charSet));
                charSet.split('').forEach(char => set.add(char));
            }
        };

        buildPool(characterPool, includeLowercase.checked, CHARS.lowercase);
        buildPool(characterPool, includeUppercase.checked, CHARS.uppercase);
        buildPool(characterPool, includeNumbers.checked, CHARS.numbers);

        let symbolSet = '';
        if (includeSymbols.checked) {
            symbolSet += CHARS.symbols;
        }
        if (customSymbols.value) {
            const uniqueCustom = Array.from(new Set(customSymbols.value.split(''))).join('');
            symbolSet += uniqueCustom;
        }
        
        if (symbolSet.length > 0) {
            ensuredChars.push(getRandomChar(symbolSet));
            symbolSet.split('').forEach(char => characterPool.add(char));
        }
        
        characters = Array.from(characterPool).join('');
        const characterPoolSize = characterPool.size;

        if (characterPoolSize === 0) {
            const errorMsg = "Error: Select at least one character type.";
            passwordOutput.value = errorMsg;
            updateStrength(errorMsg, 0); 
            copyBtn.disabled = true;
            return;
        }
        
        const uniqueEnsured = Array.from(new Set(ensuredChars)).length;

        if (length < uniqueEnsured) {
            const errorMsg = "Error: Length too short for selected options.";
            passwordOutput.value = errorMsg;
            updateStrength(errorMsg, 0);
            copyBtn.disabled = true;
            return;
        }

        let password = '';
        const remainingLength = length - uniqueEnsured;
        
        for (let i = 0; i < remainingLength; i++) {
            password += getRandomChar(characters);
        }

        password = shuffleString(Array.from(new Set(ensuredChars)).join('') + password);

        passwordOutput.value = password;
        updateStrength(password, characterPoolSize); 
        copyBtn.disabled = false;
    }

    function updateStrength(password, poolSize) {
        if (!password || password.includes("Error") || poolSize === 0) {
            strengthFill.style.width = '0%';
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'N/A';
            return;
        }

        const length = password.length;
        const entropyBits = length * Math.log2(poolSize);

        const maxEntropyVisual = 200; 
        let percent = Math.min(100, Math.floor((entropyBits / maxEntropyVisual) * 100));


        let strength = 'SUPER WEAK';
        let className = 'super-weak';
        
        if (entropyBits >= 180) { 
            strength = 'SUPER STRONG';
            className = 'super-strong'; 
        } else if (entropyBits >= 120) {
            strength = 'VERY STRONG';
            className = 'very-strong';
        } else if (entropyBits >= 80) {
            strength = 'STRONG';
            className = 'strong';
        } else if (entropyBits >= 40) {
            strength = 'MEDIUM';
            className = 'medium';
        } else if (entropyBits >= 20) {
            strength = 'WEAK';
            className = 'weak';
        }

        strengthFill.style.width = percent + '%';
        strengthFill.className = 'strength-fill ' + className;
        strengthText.textContent = strength;
    }

    function copyPassword() {
        passwordOutput.select();
        passwordOutput.setSelectionRange(0, 99999); 

        try {
            document.execCommand('copy');
            
            const originalText = copyBtn.textContent;
            
            copyBtn.style.border = 'inset 2px';
            copyBtn.style.borderColor = '#808080 #ffffff #ffffff #808080';
            copyBtn.textContent = 'COPIED!';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.border = ''; 
                copyBtn.style.borderColor = ''; 
            }, 1000);
        } catch (err) {
            console.error('Could not copy text: ', err);
            alert('Failed to copy password. Please copy manually.');
        }
    }

    lengthRange.addEventListener('input', () => {
        lengthDisplay.value = lengthRange.value;
        generatePassword();
    });
    lengthDisplay.addEventListener('change', () => {
        let val = parseInt(lengthDisplay.value);
        const min = parseInt(lengthRange.min);
        const max = parseInt(lengthRange.max);
        
        val = isNaN(val) ? min : Math.min(Math.max(val, min), max);
        
        lengthDisplay.value = val;
        lengthRange.value = val;
        
        generatePassword();
    });

    const settings = [includeUppercase, includeLowercase, includeNumbers, includeSymbols, customSymbols];
    settings.forEach(el => {
        const eventType = el.type === 'text' ? 'input' : 'change';
        el.addEventListener(eventType, generatePassword);
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);

    resetOptions(); 
    
    generatePassword(); 
});