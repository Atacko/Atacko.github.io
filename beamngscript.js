document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            alert('Download link clicked!');
        });
    });
});
