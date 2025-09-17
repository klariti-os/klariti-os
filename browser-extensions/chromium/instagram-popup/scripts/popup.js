const toggle = document.getElementById('toggle');

//load the saved state 
window.onload = () => {
    const savedState = localStorage.getItem('toggleState');
    if (savedState === 'true') {
        toggle.checked = true;
    } else {
    toggle.checked = false;
    }
};

//save state, send state to background.js
toggle.addEventListener('change', () => {
    localStorage.setItem('toggleState', toggle.checked);
    console.log(`Toggle is ${toggle.checked ? 'ON' : 'OFF'}`);
    console.log(toggle.checked)
    chrome.runtime.sendMessage({ toggleState: toggle.checked });
});