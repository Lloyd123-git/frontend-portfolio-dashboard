  //Application state and selectors
  let projects = JSON.parse(localStorage.getItem('roadmap_projects')) || [];

  //User Interface elements
  const projectForm = document.getElementById('project-form');
  const projectGrid = document.getElementById('project-grid');
  const statusFilter = document.getElementById('status-filter');
  const themeToggle = document.getElementById('theme-toggle');

  //Control light/dark theme
  const savedTheme = localStorage.getItem('app_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('app_theme', newTheme);
  updateThemeButtonIcon(newTheme);
  });

  function updateThemeButtonIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  // drop-down control 
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      renderDashboard(e.target.value);
    });
  }

  window.toggleProjectStatus = function(id) {
    const statusSequence = ['Not Startet', 'In Progress', 'Completed'];
      projects = projects.map(project => {
      if (project.id === id) {
        const nextIndex = (statusSequence.indexOf(project.status)+ 1) % statusSequence.length;
        project.status = statusSequence[nextIndex];
      }
      return project;
    });
    saveState();
    renderDashboard(statusFilter.value);
  };

  window.deleteProject = function(id) {
    projects = projects.filter(project => project.id !== id);
    saveState();
    renderDashboard(statusFilter.value);
  };

  function saveState() {
    localStorage.setItem('roadmap_projects', JSON.stringify(projects));
  }

  // Dom manipulation of data
  function renderDashboard(filterValue = 'All') {
    //Clear out current card
    projectGrid.innerHTML = '';

    

    //Filter project list objects based on active control dropdowns state
    const filteredProjects = projects.filter(project => {
        return filterValue === 'All' ? true : project.status === filterValue; 
    });

    if (filteredProjects.length === 0) {
      projectGrid.innerHTML = `
        <div class="placeholder-card" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <p>No projects listed under "${filterValue}" metrics yet. Log your first track step above!</p>
        </div>
        `;
        return;
    }

    // Map data fields out into DOM template segments 
    filteredProjects.forEach(project =>{
      const cardHTML = `
        <article class="project-card" data-id="${project.id}">
          <h3>${sanitizeHTML(project.name)}</h3>
          <p>${sanitizeHTML(project.desc)}</p>
          <span class="badge ${project.difficulty.toLowerCase()}">${project.difficulty}</span>
          <div class="card-footer">
            <span class="status-indicator"><strong>Status:</strong> ${project.status}</span>
            <div class="action-buttons">
              <button class="btn-toggle" onclick="toggleProjectStatus('${project.id}')">🔄 Update</button>
              <button class="btn-delete" onclick="deleteProject('${project.id}')">🗑️ Delete</button>
            </div>
          </div>
        </article>
      `;
      console.log(project.name);
    projectGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
  }

  // Data security

  function sanitizeHTML(str) {
    if (!str) return '';
    return str 
      .replace(/&/, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }

  // add card to page
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('project-name');
      const descInput = document.getElementById('project-desc');
      const diffInput = document.getElementById('project-difficulty');

      if (!nameInput || !descInput) return;

      const newProject = {
        id: Date.now().toString(),
        name: nameInput.value,
        desc: descInput.value,
        difficulty: diffInput ? diffInput.value : 'Medium',
        status: 'Not Started'
      };

      projects.push(newProject);
      saveState();

      projectForm.reset();
      renderDashboard(statusFilter ? statusFilter.value : 'All');

    });
  }

  document.addEventListener('DOMContentLoaded',() =>{
    renderDashboard();
  });