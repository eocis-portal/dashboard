document.addEventListener('DOMContentLoaded', function() {
    const imageSelect = document.getElementById('imageSelect');
    const displayArea = document.getElementById('displayArea');
    const displayImage = document.getElementById('displayImage');
    const displayText = document.getElementById('displayText');
    let images;

    // Function to fetch the list of image files from the JSON file
    async function fetchImageList() {
        try {
            const response = await fetch('data/GrIS_images.json'); // Path to your JSON file
            images = await response.json();
            populateSlider(images);
        } catch (error) {
            console.error('Error fetching image list:', error);
        }
    }

    // Function to populate the slider with image options
    function populateSlider(images) {
        imageSelect.max = images.length - 1;
        imageSelect.value = images.length - 1;

        // Add event listener to the slider
        imageSelect.addEventListener('input', () => {
            const selectedIndex = parseInt(imageSelect.value);
            if (images[selectedIndex]) {
                displayImage.src = `data/images/${images[selectedIndex].fileName}`; // Adjust the path to your images directory if needed
                displayArea.hidden = false;
                displayText.innerHTML = images[selectedIndex].displayName
            } else {
                displayImage.src = '';
                displayArea.hidden = true;
            }
        });
    }

    // Fetch the image list on page load
    fetchImageList();
});