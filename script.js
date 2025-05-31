
const NASA_API_KEY = "u8r5Trf9sMFt0pR4YpCdggmAqkYG0u0B4tk9E6Nx"; 


const BASE_URLS = {
    apod: "https://api.nasa.gov/planetary/apod",
    marsRovers: "https://api.nasa.gov/mars-photos/api/v1/rovers",
    epic: "https://api.nasa.gov/EPIC/api/natural", 
    epicArchive: "https://epic.gsfc.nasa.gov/archive/natural", 
    nasaLibrary: "https://images-api.nasa.gov",
    neoFeed: "https://api.nasa.gov/neo/rest/v1/feed"
};



const globalLoader = document.getElementById('global-loader');
const navLinks = document.querySelectorAll('.nav-link');
const featureSections = document.querySelectorAll('.feature-section');


function showLoader(element = globalLoader) {
    element.style.display = 'flex';
}

function hideLoader(element = globalLoader) {
    element.style.display = 'none';
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        displayMessage(globalLoader.parentNode.id, `Failed to load data: ${error.message}. Please try again.`, 'error');
        return null; 
    }
}

function displayMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return; 
    

    container.innerHTML = ''; 

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
}



function activateSection(sectionId) {
    featureSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}


const apodDateInput = document.getElementById('apod-date');
const getApodBtn = document.getElementById('get-apod-btn');
const apodContent = document.getElementById('apod-content');

async function getAPOD() {
    showLoader();
    apodContent.innerHTML = ''; 

    const date = apodDateInput.value;
    let url = `${BASE_URLS.apod}?api_key=${NASA_API_KEY}`;
    if (date) {
        url += `&date=${date}`;
    }

    const data = await fetchData(url);
    hideLoader();

    if (data) {
        let mediaHtml = '';
        if (data.media_type === 'image') {
            mediaHtml = `<img src="${data.url}" alt="${data.title}">`;
        } else if (data.media_type === 'video') {
           
            mediaHtml = `<iframe width="560" height="315" src="${data.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            mediaHtml = `<p>Media type (${data.media_type}) not supported for display.</p>`;
        }

        apodContent.innerHTML = `
            ${mediaHtml}
            <h3>${data.title}</h3>
            <p>${data.explanation}</p>
        `;
    } else {
        displayMessage('apod-content', 'Failed to load APOD. Please try a different date or check your connection.', 'error');
    }
}


const roverSelect = document.getElementById('rover-select');
const solInput = document.getElementById('sol-input');
const cameraSelect = document.getElementById('camera-select');
const getRoverPhotosBtn = document.getElementById('get-rover-photos-btn');
const marsPhotosGallery = document.getElementById('mars-photos-gallery');
const marsRoverInfo = document.getElementById('mars-rover-info');


const roverCameras = {
    curiosity: [
        { value: 'all', text: 'ALL' }, { value: 'FHAZ', text: 'Front Hazard Avoidance Camera' },
        { value: 'RHAZ', text: 'Rear Hazard Avoidance Camera' }, { value: 'MAST', text: 'Mast Camera' },
        { value: 'CHEMCAM', text: 'Chemistry and Camera Complex' }, { value: 'NAVCAM', text: 'Navigation Camera' }
    ],
    opportunity: [
        { value: 'all', text: 'ALL' }, { value: 'FHAZ', text: 'Front Hazard Avoidance Camera' },
        { value: 'RHAZ', text: 'Rear Hazard Avoidance Camera' }, { value: 'PANCAM', text: 'Panoramic Camera' },
        { value: 'MINITES', text: 'Miniature Thermal Emission Spectrometer (Mini-TES)' },
        { value: 'NAVCAM', text: 'Navigation Camera' }
    ],
    spirit: [
        { value: 'all', text: 'ALL' }, { value: 'FHAZ', text: 'Front Hazard Avoidance Camera' },
        { value: 'RHAZ', text: 'Rear Hazard Avoidance Camera' }, { value: 'PANCAM', text: 'Panoramic Camera' },
        { value: 'MINITES', text: 'Miniature Thermal Emission Spectrometer (Mini-TES)' },
        { value: 'NAVCAM', text: 'Navigation Camera' }
    ]
};

function populateCameraOptions() {
    const selectedRover = roverSelect.value;
    const cameras = roverCameras[selectedRover] || [];
    cameraSelect.innerHTML = cameras.map(cam => `<option value="${cam.value}">${cam.text}</option>`).join('');
}

async function getMarsRoverPhotos() {
    showLoader();
    marsPhotosGallery.innerHTML = ''; 
    marsRoverInfo.innerHTML = ''; 

    const rover = roverSelect.value;
    const sol = solInput.value;
    const camera = cameraSelect.value;

    let url = `${BASE_URLS.marsRovers}/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
    if (camera !== 'all') {
        url += `&camera=${camera}`;
    }

    const data = await fetchData(url);
    hideLoader();

    if (data && data.photos.length > 0) {
        marsPhotosGallery.innerHTML = data.photos.map(photo => `
            <div class="photo-card glass-effect">
                <img src="${photo.img_src}" alt="Mars Rover Photo">
                <div class="caption">
                    <strong>Rover:</strong> ${photo.rover.name}<br>
                    <strong>Camera:</strong> ${photo.camera.full_name}<br>
                    <strong>Earth Date:</strong> ${photo.earth_date}<br>
                    <strong>Sol:</strong> ${photo.sol}
                </div>
            </div>
        `).join('');
        marsRoverInfo.innerHTML = `Displaying ${data.photos.length} photos for ${rover.toUpperCase()} on Sol ${sol}.`;
    } else {
        displayMessage('mars-photos-gallery', 'No photos found for these criteria. Try a different sol or camera.', 'info');
    }
}


const epicDateInput = document.getElementById('epic-date');
const getEpicBtn = document.getElementById('get-epic-btn');
const epicContent = document.getElementById('epic-content');

async function getEPICImage() {
    showLoader();
    epicContent.innerHTML = '';

    const date = epicDateInput.value;
    let apiUrl = `${BASE_URLS.epic}?api_key=${NASA_API_KEY}`;
    let imageDate = '';

    
    const datesData = await fetchData(`${BASE_URLS.epic}/all?api_key=${NASA_API_KEY}`);
    if (!datesData || datesData.length === 0) {
        hideLoader();
        displayMessage('epic-content', 'Could not retrieve available EPIC dates.','error');
        return;
    }

    
    if (date) {
        
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const dateExists = datesData.some(d => d.date.startsWith(formattedDate));
        if (dateExists) {
             apiUrl = `${BASE_URLS.epic}/date/${formattedDate}?api_key=${NASA_API_KEY}`;
             imageDate = formattedDate;
        } else {
            
            displayMessage('epic-content', `No EPIC images for ${formattedDate}. Displaying latest available.`, 'info');
            imageDate = datesData[0].date.split(' ')[0]; 
            apiUrl = `${BASE_URLS.epic}/date/${imageDate}?api_key=${NASA_API_KEY}`;
        }
    } else {
        
        imageDate = datesData[0].date.split(' ')[0]; 
        apiUrl = `${BASE_URLS.epic}/date/${imageDate}?api_key=${NASA_API_KEY}`;
    }

    const data = await fetchData(apiUrl);
    hideLoader();

    if (data && data.length > 0) {
        const latestImage = data[0]; 
        const year = imageDate.substring(0, 4);
        const month = imageDate.substring(5, 7);
        const day = imageDate.substring(8, 10);
        const imageUrl = `${BASE_URLS.epicArchive}/${year}/${month}/${day}/png/${latestImage.image}.png?api_key=${NASA_API_KEY}`;

        epicContent.innerHTML = `
            <img src="${imageUrl}" alt="Earth from EPIC - ${latestImage.caption}">
            <h3>${latestImage.caption}</h3>
            <p><strong>Date:</strong> ${new Date(latestImage.date).toLocaleString()}</p>
        `;
    } else {
        displayMessage('epic-content', 'No EPIC images found for this date. Try a different date.', 'info');
    }
}


const librarySearchInput = document.getElementById('library-search-input');
const searchLibraryBtn = document.getElementById('search-library-btn');
const libraryResults = document.getElementById('library-results');

async function searchNASALibrary() {
    showLoader();
    libraryResults.innerHTML = '';

    const query = librarySearchInput.value.trim();
    if (!query) {
        hideLoader();
        displayMessage('library-results', 'Please enter a search term.', 'info');
        return;
    }

    const url = `${BASE_URLS.nasaLibrary}/search?q=${encodeURIComponent(query)}`;
    const data = await fetchData(url);
    hideLoader();

    if (data && data.collection && data.collection.items.length > 0) {
        libraryResults.innerHTML = data.collection.items.map(item => {
            const title = item.data[0]?.title || 'No Title';
            const description = item.data[0]?.description || 'No Description';
            const mediaType = item.data[0]?.media_type || 'unknown';
            const thumbnail = item.links?.[0]?.href || 'placeholder.jpg'; 

            
            return `
                <div class="photo-card glass-effect">
                    <img src="${thumbnail}" alt="${title}">
                    <div class="caption">
                        <strong>Title:</strong> ${title}<br>
                        <strong>Type:</strong> ${mediaType}<br>
                        ${description.length > 100 ? description.substring(0, 97) + '...' : description}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        displayMessage('library-results', 'No results found for your search. Try a different keyword.', 'info');
    }
}


const neoStartDateInput = document.getElementById('neo-start-date');
const neoEndDateInput = document.getElementById('neo-end-date');
const getNeoBtn = document.getElementById('get-neo-btn');
const neoList = document.getElementById('neo-list');

async function getNEOs() {
    showLoader();
    neoList.innerHTML = '';

    const startDate = neoStartDateInput.value;
    const endDate = neoEndDateInput.value;

    if (!startDate || !endDate) {
        hideLoader();
        displayMessage('neo-list', 'Please select both start and end dates.', 'info');
        return;
    }

    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
        hideLoader();
        displayMessage('neo-list', 'NEO API only allows a date range of up to 7 days.', 'info');
        return;
    }

    const url = `${BASE_URLS.neoFeed}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
    const data = await fetchData(url);
    hideLoader();

    if (data && data.near_earth_objects) {
        let neoHtml = '<ul>';
        let foundAny = false;
        for (const dateKey in data.near_earth_objects) {
            neoHtml += `<li><strong>Date: ${dateKey}</strong><ul>`;
            data.near_earth_objects[dateKey].forEach(neo => {
                foundAny = true;
                const minDiameter = neo.estimated_diameter.meters.estimated_diameter_min.toFixed(2);
                const maxDiameter = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(2);
                const closeApproachData = neo.close_approach_data[0]; 
                const approachDate = closeApproachData ? new Date(closeApproachData.close_approach_date_full).toLocaleString() : 'N/A';
                const missDistanceKm = closeApproachData ? parseFloat(closeApproachData.miss_distance.kilometers).toLocaleString() : 'N/A';
                const isHazardous = neo.is_potentially_hazardous_asteroid ? '<span style="color: #FF6666;">Yes</span>' : '<span style="color: #66FF66;">No</span>'; 

                neoHtml += `
                    <li class="glass-effect">
                        <strong>Name:</strong> <a href="${neo.nasa_jpl_url}" target="_blank" style="color: var(--color-accent);">${neo.name}</a><br>
                        <span><strong>Estimated Diameter (m):</strong> ${minDiameter} - ${maxDiameter}</span><br>
                        <span><strong>Potentially Hazardous:</strong> ${isHazardous}</span><br>
                        <span><strong>Close Approach:</strong> ${approachDate}</span><br>
                        <span><strong>Miss Distance (km):</strong> ${missDistanceKm}</span>
                    </li>
                `;
            });
            neoHtml += `</ul></li>`;
        }
        neoHtml += '</ul>';

        if (foundAny) {
            neoList.innerHTML = neoHtml;
        } else {
            displayMessage('neo-list', 'No Near-Earth Objects found for the selected date range.', 'info');
        }

    } else {
        displayMessage('neo-list', 'Failed to load NEO data. Please check dates or connection.', 'error');
    }
}



document.addEventListener('DOMContentLoaded', () => {
    
    const today = new Date().toISOString().split('T')[0];
    apodDateInput.setAttribute('max', today);
    epicDateInput.setAttribute('max', today);
    neoStartDateInput.setAttribute('max', today);
    neoEndDateInput.setAttribute('max', today);

    
    activateSection('apod');
    getAPOD();

    
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const sectionId = event.target.dataset.section;
            activateSection(sectionId);
            
            
            if (sectionId === 'apod') getAPOD();
            if (sectionId === 'mars-rovers') getMarsRoverPhotos(); 
            if (sectionId === 'epic') getEPICImage(); 
            if (sectionId === 'nasa-library') searchNASALibrary(); 
            if (sectionId === 'neo') getNEOs(); 
        });
    });

    
    getApodBtn.addEventListener('click', getAPOD);

    roverSelect.addEventListener('change', populateCameraOptions);
    getRoverPhotosBtn.addEventListener('click', getMarsRoverPhotos);
    populateCameraOptions(); 

    getEpicBtn.addEventListener('click', getEPICImage);

    searchLibraryBtn.addEventListener('click', searchNASALibrary);
    librarySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchNASALibrary();
    });

    getNeoBtn.addEventListener('click', getNEOs);
});