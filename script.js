document.addEventListener('DOMContentLoaded', () => {
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const addEducationBtn = document.getElementById('addEducation');
    const addExperienceBtn = document.getElementById('addExperience');
    const clearFormBtn = document.getElementById('clearForm');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const educationSection = document.getElementById('educationSection');
    const experienceSection = document.getElementById('experienceSection');
    const progressBar = document.getElementById('progressBar');
    const templateSelect = document.getElementById('templateSelect');
    const copyrightClaim = document.getElementById('copyrightClaim');

    // --- Initial Setup Functions ---

    // Set copyright year
    copyrightClaim.textContent = `Copyright © ${new Date().getFullYear()} Joydeep Bhattacharya. All rights reserved.`;

    // Function to update CSS variables for the current template
    const applyTemplateStyles = (templateName) => {
        const body = document.body;
        body.className = ''; // Clear existing template classes
        body.classList.add(`template-${templateName}`);

        // Update CSS variables (this is redundant as CSS handles it via :root scoping, but good for explicit JS control if needed)
        const root = document.documentElement;
        if (templateName === 'modern') {
            root.style.setProperty('--current-primary-color', 'var(--modern-primary-color)');
            root.style.setProperty('--current-secondary-color', 'var(--modern-secondary-color)');
            root.style.setProperty('--current-accent-color', 'var(--modern-accent-color)');
            root.style.setProperty('--current-font-heading', 'var(--modern-font-heading)');
            root.style.setProperty('--current-font-body', 'var(--modern-font-body)');
        } else if (templateName === 'classic') {
            root.style.setProperty('--current-primary-color', 'var(--classic-primary-color)');
            root.style.setProperty('--current-secondary-color', 'var(--classic-secondary-color)');
            root.style.setProperty('--current-accent-color', 'var(--classic-accent-color)');
            root.style.setProperty('--current-font-heading', 'var(--classic-font-heading)');
            root.style.setProperty('--current-font-body', 'var(--classic-font-body)');
        }
    };

    // --- Resume Preview Update Function ---
    const updateResumePreview = () => {
        const formData = new FormData(resumeForm);
        const data = {};
        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                if (!data[baseKey]) {
                    data[baseKey] = [];
                }
                data[baseKey].push(value);
            } else {
                data[key] = value;
            }
        });

        let educationItems = [];
        const numEducation = data.school ? data.school.length : 0;
        for (let i = 0; i < numEducation; i++) {
            // Correctly get the checked radio button for the specific education item
            const educationItemElement = document.querySelector(`#educationSection .education-item:nth-child(${i + 1})`);
            const scoreType = educationItemElement ? educationItemElement.querySelector('input[name="gpaType[]"]:checked')?.value || 'gpa' : 'gpa';
            const academicScore = data.academicScore && data.academicScore[i] ? data.academicScore[i] : '';

            educationItems.push({
                school: data.school[i],
                location: data.schoolLocation[i],
                start: data.schoolStart[i],
                end: data.schoolEnd[i],
                coursework: data.coursework[i],
                scoreType: scoreType,
                academicScore: academicScore
            });
        }

        let experienceItems = [];
        const numExperience = data.jobTitle ? data.jobTitle.length : 0;
        for (let i = 0; i < numExperience; i++) {
            experienceItems.push({
                title: data.jobTitle[i],
                company: data.company[i],
                location: data.jobLocation[i],
                start: data.jobStart[i],
                end: data.jobEnd[i],
                responsibilities: data.responsibilities[i] ? data.responsibilities[i].split(',').map(item => item.trim()).filter(item => item) : []
            });
        }

        const awards = data.awards ? data.awards.split(',').map(item => item.trim()).filter(item => item) : [];
        const skills = data.skills ? data.skills.split(',').map(item => item.trim()).filter(item => item) : [];
        const extracurriculars = data.extracurriculars ? data.extracurriculars.split('\n').map(item => item.trim()).filter(item => item) : [];

        // Check if pronouns should be displayed
        const displayPronouns = data.pronouns && data.pronouns.trim() !== '';

        let resumeHtml = `
            <div class="resume-header">
                <div class="resume-name-container"> <div class="resume-name">${data.fullName || 'JUDE RILEY'}</div>
                    ${displayPronouns ? `<div class="resume-pronouns">${data.pronouns}</div>` : ''}
                </div>
                <div class="resume-contact-info">
                    <i class="fas fa-phone"></i> ${data.phone || '555 978 2296'}<br>
                    <i class="fas fa-envelope"></i> ${data.email || 'j.riley@email.sp.com'}
                </div>
            </div>
            <div class="resume-summary">
                ${data.summary || 'Ambitious and motivated student with an outstanding academic track record and a passion for helping others. Great creative thinker, excellent people skills and strong work ethic. Seeking to apply my organizational and communication skills to the Business summer internship at your company.'}
            </div>
        `;

        if (educationItems.length > 0 && educationItems[0].school) {
            resumeHtml += `
                <div class="resume-section" id="previewEducation">
                    <h3>Education</h3>
                    <ul>
            `;
            educationItems.forEach(edu => {
                const scoreText = edu.academicScore ?
                    (edu.scoreType === 'gpa' ? `Unweighted GPA: ${edu.academicScore}` : `Percentage: ${edu.academicScore}%`) : '';
                resumeHtml += `
                    <li>
                        <div>
                            <div class="resume-item-title">${edu.school || ''}</div>
                            <div class="resume-item-details">${edu.location || ''} | ${edu.start || ''} - ${edu.end || ''}</div>
                            ${edu.coursework ? `<div class="resume-item-details">Relevant coursework: ${edu.coursework}</div>` : ''}
                            ${scoreText ? `<div class="resume-item-details">${scoreText}</div>` : ''}
                        </div>
                    </li>
                `;
            });
            resumeHtml += `</ul></div>`;
        }


        if (experienceItems.length > 0 && experienceItems[0].company) {
            resumeHtml += `
                <div class="resume-section" id="previewExperience">
                    <h3>Experience</h3>
                    <ul>
            `;
            experienceItems.forEach(exp => {
                resumeHtml += `
                    <li>
                        <div>
                            <div class="resume-item-title">${exp.company || ''} - ${exp.title || ''}</div>
                            <div class="resume-item-details">${exp.location || ''} | ${exp.start || ''} - ${exp.end || ''}</div>
                            ${exp.responsibilities.length > 0 ? `
                                <div class="resume-item-description">
                                    <ul>
                                        ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </li>
                `;
            });
            resumeHtml += `</ul></div>`;
        }

        if (awards.length > 0) {
            resumeHtml += `
                <div class="resume-section" id="previewAwards">
                    <h3>Awards & Merits</h3>
                    <ul>
                        ${awards.map(award => `<li><div>${award}</div></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (skills.length > 0) {
            resumeHtml += `
                <div class="resume-section" id="previewSkills">
                    <h3>Skills</h3>
                    <ul>
                        ${skills.map(skill => `<li><div>${skill}</div></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (extracurriculars.length > 0) {
            resumeHtml += `
                <div class="resume-section" id="previewExtracurriculars">
                    <h3>Extracurriculars</h3>
                    <ul>
                        ${extracurriculars.map(extra => {
                            const parts = extra.split('(');
                            const main = parts[0].trim();
                            const subDetails = parts.length > 1 ? parts[1].replace(')', '').split(',').map(s => s.trim()).filter(s => s) : [];
                            return `
                                <li>
                                    <div>
                                        <div class="resume-item-title">${main}</div>
                                        ${subDetails.length > 0 ? `
                                            <div class="resume-item-description">
                                                <ul>
                                                    ${subDetails.map(detail => `<li>${detail}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            `;
        }

        // Apply new content
        resumePreview.innerHTML = resumeHtml;

        // Trigger fade-in animation for newly added sections
        setTimeout(() => {
            resumePreview.querySelectorAll('.resume-section').forEach(section => {
                section.classList.add('fade-in');
            });
        }, 50);
    };

    // --- Progress Bar Update Function ---
    const updateProgressBar = () => {
        const formInputs = resumeForm.querySelectorAll('input:not([type="hidden"]):not([type="radio"]), textarea'); // Exclude radios
        let filledInputs = 0;
        let totalInputs = 0;

        formInputs.forEach(input => {
            if (input.name !== '' && !input.classList.contains('remove-item-btn')) {
                totalInputs++;
                if (input.value.trim() !== '') {
                    filledInputs++;
                }
            }
        });

        // Account for radio buttons: count at least one selection per group as "filled"
        const radioGroups = new Set();
        resumeForm.querySelectorAll('input[type="radio"]').forEach(radio => {
            radioGroups.add(radio.name);
        });

        radioGroups.forEach(groupName => {
            totalInputs++; // Each group is one "input"
            if (resumeForm.querySelector(`input[name="${groupName}"]:checked`)) {
                filledInputs++;
            }
        });

        const progress = totalInputs > 0 ? (filledInputs / totalInputs) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    };

    // --- Dynamic Row Addition Functions ---

    // Function to handle score type change (GPA/Percentage)
    const handleScoreTypeChange = (event) => {
        const educationItem = event.target.closest('.education-item');
        const scoreInputContainer = educationItem.querySelector('.academic-score-input');
        const scoreLabel = scoreInputContainer.querySelector('.score-label');
        const scoreInput = scoreInputContainer.querySelector('.gpa-percentage-input');

        if (event.target.value === 'gpa') {
            scoreLabel.innerHTML = '<i class="fas fa-graduation-cap"></i> Unweighted GPA:';
            scoreInputContainer.setAttribute('data-score-type', 'gpa');
            scoreInput.placeholder = 'e.g., 3.9';
        } else {
            scoreLabel.innerHTML = '<i class="fas fa-percent"></i> Percentage:';
            scoreInputContainer.setAttribute('data-score-type', 'percentage');
            scoreInput.placeholder = 'e.g., 95';
        }
        updateResumePreview();
        updateProgressBar();
    };

    // Attach listeners for initial education item's score type
    document.querySelectorAll('#educationSection .education-item .radio-group input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleScoreTypeChange);
    });


    // Function to add a new education row
    addEducationBtn.addEventListener('click', () => {
        const educationItemDiv = document.createElement('div');
        educationItemDiv.classList.add('education-item');
        const uniqueId = Date.now(); // For unique IDs of radio buttons
        educationItemDiv.innerHTML = `
            <div class="form-group">
                <label><i class="fas fa-school"></i> School Name:</label>
                <input type="text" class="school" name="school[]" placeholder="University/College/School">
            </div>
            <div class="form-group">
                <label><i class="fas fa-map-marker-alt"></i> Location:</label>
                <input type="text" class="school-location" name="schoolLocation[]" placeholder="City, State">
            </div>
            <div class="form-group-inline">
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Start Date:</label>
                    <input type="text" class="school-start" name="schoolStart[]" placeholder="Month YYYY">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> End Date:</label>
                    <input type="text" class="school-end" name="schoolEnd[]" placeholder="Month YYYY or Present">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-book-open"></i> Relevant Coursework:</label>
                <input type="text" class="coursework" name="coursework[]" placeholder="e.g., Computer Science, Data Structures">
            </div>
            <div class="form-group">
                <label>Academic Score Type:</label>
                <div class="radio-group">
                    <input type="radio" id="gpaType${uniqueId}" name="gpaType[]" value="gpa" checked>
                    <label for="gpaType${uniqueId}">GPA</label>
                    <input type="radio" id="percentageType${uniqueId}" name="gpaType[]" value="percentage">
                    <label for="percentageType${uniqueId}">Percentage</label>
                </div>
            </div>
            <div class="form-group academic-score-input" data-score-type="gpa">
                <label for="academicScore${uniqueId}" class="score-label"><i class="fas fa-graduation-cap"></i> Unweighted GPA:</label>
                <input type="text" id="academicScore${uniqueId}" class="gpa-percentage-input" name="academicScore[]" placeholder="e.g., 3.9">
            </div>
            <button type="button" class="remove-item-btn"><i class="fas fa-minus-circle"></i> Remove</button>
        `;
        educationSection.insertBefore(educationItemDiv, addEducationBtn);

        // Attach listeners for newly added radio buttons
        educationItemDiv.querySelectorAll('.radio-group input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', handleScoreTypeChange);
        });

        educationItemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
            educationItemDiv.remove();
            updateResumePreview();
            updateProgressBar();
        });
        updateResumePreview();
        updateProgressBar();
    });

    // Function to add a new experience row
    addExperienceBtn.addEventListener('click', () => {
        const experienceItemDiv = document.createElement('div');
        experienceItemDiv.classList.add('experience-item');
        experienceItemDiv.innerHTML = `
            <div class="form-group">
                <label><i class="fas fa-briefcase"></i> Job Title/Role:</label>
                <input type="text" class="job-title" name="jobTitle[]" placeholder="Software Engineer Intern">
            </div>
            <div class="form-group">
                <label><i class="fas fa-building"></i> Company Name:</label>
                <input type="text" class="company" name="company[]" placeholder="Tech Innovations Inc.">
            </div>
            <div class="form-group">
                <label><i class="fas fa-map-marker-alt"></i> Location:</label>
                <input type="text" class="job-location" name="jobLocation[]" placeholder="City, State">
            </div>
            <div class="form-group-inline">
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Start Date:</label>
                    <input type="text" class="job-start" name="jobStart[]" placeholder="Month YYYY">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> End Date:</label>
                    <input type="text" class="job-end" name="jobEnd[]" placeholder="Month YYYY or Present">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-list-alt"></i> Responsibilities (comma-separated):</label>
                <textarea class="responsibilities" name="responsibilities[]" rows="3" placeholder="Developed web applications, Collaborated with team, Implemented new features"></textarea>
            </div>
            <button type="button" class="remove-item-btn"><i class="fas fa-minus-circle"></i> Remove</button>
        `;
        experienceSection.insertBefore(experienceItemDiv, addExperienceBtn);
        experienceItemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
            experienceItemDiv.remove();
            updateResumePreview();
            updateProgressBar();
        });
        updateResumePreview();
        updateProgressBar();
    });

    // --- Event Listeners ---

    // Event listener for form input changes (real-time update)
    resumeForm.addEventListener('input', () => {
        updateResumePreview();
        updateProgressBar();
    });

    // Event listener for template selection
    templateSelect.addEventListener('change', (event) => {
        applyTemplateStyles(event.target.value);
        updateResumePreview(); // Re-render preview with new styles
    });

    // Function to clear the form and reset preview
    clearFormBtn.addEventListener('click', () => {
        resumeForm.reset();
        // Manually reset dynamically added sections by removing all but the first child
        document.querySelectorAll('.education-item:not(:first-child)').forEach(item => item.remove());
        document.querySelectorAll('.experience-item:not(:first-child)').forEach(item => item.remove());

        // Reset the default values of the first education and experience items
        // This targets the specific input elements directly
        document.querySelector('.education-item .school').value = 'Fendsmore High School';
        document.querySelector('.education-item .school-location').value = 'Chicago, IL';
        document.querySelector('.education-item .school-start').value = 'Sep 2019';
        document.querySelector('.education-item .school-end').value = 'Present';
        document.querySelector('.education-item .coursework').value = 'Economics, Business';
        // Reset GPA type to GPA and value
        document.querySelector('.education-item #gpaType1').checked = true; // Ensure first GPA radio is checked
        document.querySelector('.education-item .academic-score-input').setAttribute('data-score-type', 'gpa');
        document.querySelector('.education-item .academic-score-input .score-label').innerHTML = '<i class="fas fa-graduation-cap"></i> Unweighted GPA:';
        document.querySelector('.education-item .gpa-percentage-input').value = '3.9';
        document.querySelector('.education-item .gpa-percentage-input').placeholder = '3.9';


        document.querySelector('.experience-item .job-title').value = 'Volunteer';
        document.querySelector('.experience-item .company').value = 'Clean Parks Association';
        document.querySelector('.experience-item .job-location').value = 'Chicago, IL';
        document.querySelector('.experience-item .job-start').value = 'Jun 2018';
        document.querySelector('.experience-item .job-end').value = 'Present';
        document.querySelector('.experience-item .responsibilities').value = 'Operated weekly clean-ups in local parkland areas, Participated in educational interventions in schools, Created flyers and posters to raise awareness, Created community engagement through social media';

        // Reset the main form fields to their placeholder/default values
        document.getElementById('fullName').value = '';
        document.getElementById('pronouns').value = '';
        document.getElementById('summary').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('email').value = '';
        document.getElementById('awards').value = '';
        document.getElementById('skills').value = '';
        document.getElementById('extracurriculars').value = '';

        updateResumePreview();
        updateProgressBar();
    });

    // Download PDF (Bonus - requires html2pdf.js library)
    downloadPdfBtn.addEventListener('click', () => {
        const element = resumePreview;
        const opt = {
            margin: 10,
            filename: 'Joydeep_Bhattacharya_Resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    });

    // --- Initial Load ---
    updateResumePreview();
    updateProgressBar();
});