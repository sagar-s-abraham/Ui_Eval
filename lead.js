document.addEventListener("DOMContentLoaded", function() {
    const circles = document.querySelectorAll('.circle');
   
    circles.forEach(circle => {
        // Initialize the steps with inactive color by default
        const step = circle.closest('.step');
        if (circle.innerText === '6') {
            step.classList.add('inactive-lost');  // 6th step starts with inactive color
        } else if (circle.innerText === '5') {
            step.classList.add('inactive-won');  // 5th step starts with inactive color
        }

        circle.addEventListener('click', function() {
            // Remove 'active', 'closed-lost', and 'closed-won' classes from all steps
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active');
                step.classList.remove('closed-lost');
                step.classList.remove('closed-won');
                step.classList.remove('inactive-lost');
                step.classList.remove('inactive-won');
            });

            // Add 'active' class to the clicked step
            step.classList.add('active');

            // Check if the clicked step is the 6th (Closed Lost) or 5th (Closed Won)
            const stepNumber = step.querySelector('.circle').innerText;

            if (stepNumber === '6') {
                // Change the circle, text, and progress line to red when clicked
                step.classList.add('closed-lost');
            } else if (stepNumber === '5') {
                // Change the circle, text, and progress line to green when clicked
                step.classList.add('closed-won');
            }

            // Update the progress line color based on the clicked step
            document.querySelectorAll('.progress-line').forEach(line => {
                if (stepNumber === '6') {
                    line.style.backgroundColor = '#f87171';  
                } else if (stepNumber === '5') {
                    line.style.backgroundColor = '#34d399';  
                } else {
                    line.style.backgroundColor = '$inactive-color';  
                }
            });
        });
    });
});