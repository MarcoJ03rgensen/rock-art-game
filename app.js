// Game State Management
const game = {
  currentStage: 0,
  collectedMaterials: [],
  preparedPaints: [],
  selectedWallArea: null,
  currentTechnique: 'finger',
  currentAnimal: 'horse',
  currentColor: '#8B4513',
  isDrawing: false,
  brushSize: 10,
  templateVisible: true,
  
  // Specific minerals identified at Lascaux (17,190 ± 140 BP)
  minerals: {
    'romanechite': { 
      name: 'Romanechite (Ba₂Mn₅O₁₀·nH₂O)', 
      color: '#2C2C2C', 
      source: 'Central Pyrénées (Vieille-Aure, Ariège)',
      distance: '~250 km from Lascaux',
      technique: 'Brush application',
      location: 'Great Bull chignon (between ears)',
      fact: 'Micro-XANES spectroscopy (Chalmin et al. 2006) identified romanechite in the Great Bull painting. This barium-manganese oxide was deliberately mixed with quartz, clay, and iron oxide for brush application. No local Dordogne deposits exist—indicating long-distance procurement from the Pyrénées during the Solutrean-Badegoulian transition.',
      citation: 'Chalmin, E., Menu, M., & Farges, F. (2006). Stanford/ESRF study.'
    },
    'hausmannite': { 
      name: 'Hausmannite (Mn₃O₄)', 
      color: '#1C1C1C', 
      source: 'Hautes-Pyrénées (Labiat region)',
      distance: '~250 km from Lascaux',
      technique: 'Blow/spray application',
      location: 'Great Bull muffle (snout)',
      fact: 'Hausmannite was detected via TEM analysis in the Great Bull\'s muffle (snout). Formation requires >1000°C or specific chemical processes. This is the FIRST documented use of hausmannite in prehistoric art. Mixed with calcite and Fe-rich clays for blow/spray technique—distinct from romanechite preparation, demonstrating sophisticated material-technique matching.',
      citation: 'Chalmin et al. (2006). Never before found in prehistoric pigments.',
      rarity: 'Unique finding'
    },
    'hematite': { 
      name: 'Hematite (Fe₂O₃)', 
      color: '#8B4513', 
      source: 'Local Dordogne iron-rich clay deposits',
      distance: '25-40 km from Lascaux',
      technique: 'Multiple techniques',
      fact: 'Hematite (iron oxide) provides red coloration. Chemical analysis (Jezequel et al. 2011) shows Lascaux red pigments contain hematite mixed with clays, carbon matter, and carbonates. Sourced locally from Dordogne region, unlike manganese minerals which required long-distance transport.',
      citation: 'Jezequel et al. (2011). Local Dordogne sourcing confirmed.'
    },
    'goethite': { 
      name: 'Goethite (FeOOH)', 
      color: '#DAA520', 
      source: 'Local Dordogne ochre deposits',
      distance: '25-40 km from Lascaux',
      technique: 'Multiple techniques',
      fact: 'Goethite (iron oxyhydroxide) provides yellow pigmentation. Found in local ochre deposits within the Dordogne region. Sometimes heated to convert to hematite (red). Analysis shows goethite mixed with clay matrix for application.',
      citation: 'Local Dordogne ochre deposits. Heating transforms to red hematite.'
    }
  },
  
  // Stage 2 state
  currentMaterialInMortar: null,
  grindProgress: 0,
  isGrinding: false,
  grindInterval: null,
  
  // Canvas contexts
  paintCtx: null,
  finishCtx: null,
  
  // Initialize game
  init() {
    this.setupEventListeners();
    this.showScreen('titleScreen');
  },
  
  // Start game
  startGame() {
    this.currentStage = 1;
    this.showScreen('stage1');
    document.getElementById('progressBar').style.display = 'block';
    this.updateProgress();
  },
  
  // Show screen
  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
  },
  
  // Update progress bar
  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const percentage = (this.currentStage / 5) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `Stage ${this.currentStage}/5`;
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Stage 1: Landscape clicking
    const clickableAreas = document.querySelectorAll('.clickable-area');
    clickableAreas.forEach(area => {
      area.addEventListener('click', (e) => this.collectMaterial(e));
    });
    
    // Stage 3: Wall selection
    const wallAreas = document.querySelectorAll('.selectable-wall');
    wallAreas.forEach(area => {
      area.addEventListener('click', (e) => this.selectWallArea(e));
    });
  },
  
  // Stage 1: Collect mineral
  collectMaterial(e) {
    if (this.currentStage !== 1) return;
    
    const area = e.target;
    if (area.classList.contains('collected')) return;
    
    const materialType = area.dataset.material;
    const mineral = this.minerals[materialType];
    
    if (!mineral) return;
    
    // Mark as collected
    area.classList.add('collected');
    this.collectedMaterials.push({ type: materialType, ...mineral });
    
    // Update UI
    this.updateCollectedItems();
    
    // Show detailed info modal with scientific content
    const modalContent = `
      <p><strong>Mineral:</strong> ${mineral.name}</p>
      <p><strong>Source:</strong> ${mineral.source}</p>
      <p><strong>Distance:</strong> ${mineral.distance}</p>
      ${mineral.technique ? `<p><strong>Application Method:</strong> ${mineral.technique}</p>` : ''}
      ${mineral.location ? `<p><strong>Documented Location:</strong> ${mineral.location}</p>` : ''}
      <hr style="margin: 16px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
      <p>${mineral.fact}</p>
      <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>${mineral.citation}</em></p>
    `;
    this.showInfoModal('Mineral Identified', modalContent);
    
    // Enable next button if at least 3 materials collected (academic minimum)
    if (this.collectedMaterials.length >= 3) {
      document.getElementById('stage1Next').disabled = false;
    }
  },
  
  // Update collected items display
  updateCollectedItems() {
    const listElement = document.getElementById('collectedList');
    listElement.innerHTML = '';
    
    this.collectedMaterials.forEach(material => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'collected-item';
      itemDiv.innerHTML = `
        <div class="item-color" style="background-color: ${material.color};"></div>
        <span class="item-name">${material.name}</span>
      `;
      listElement.appendChild(itemDiv);
    });
  },
  
  // Show info modal
  showInfoModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = `<p>${content}</p>`;
    document.getElementById('infoModal').style.display = 'flex';
  },
  
  // Close modal
  closeModal() {
    document.getElementById('infoModal').style.display = 'none';
  },
  
  // Next stage with transition
  nextStage() {
    const transitions = {
      1: {
        title: 'Scientific Analysis: Deliberate Mineral Mixtures',
        content: `<p><strong>Micro-XANES and TEM analysis</strong> of the Great Bull painting revealed something remarkable: artists created <strong>DIFFERENT mineral mixtures for DIFFERENT application techniques</strong>.</p>
                  <p><strong>Grinding Method:</strong> Stone tools, specifically shoulder blades of large herbivores used as mortars. Pestles: hard limestone or quartzite. Ground to micron-scale particle size.</p>
                  <p><strong>Chignon Mixture (brush-applied):</strong> Romanechite + quartz + clay + iron oxide</p>
                  <p><strong>Muffle Mixture (blow-applied):</strong> Hausmannite + calcite + Fe-rich clays</p>
                  <p><strong>Critical Finding:</strong> This demonstrates sophisticated understanding of material properties and deliberate matching of preparations to techniques. (Chalmin et al. 2006)</p>
                  <p><strong>Important:</strong> NO biotite/feldspar extenders at Lascaux (17,190 BP). Those recipes appear LATER at Niaux cave (12,000-14,000 BP, Magdalenian). Lascaux predates those formulations.</p>`
      },
      2: {
        title: 'Cave Environment: Dry Calcite Surfaces',
        content: `<p><strong>Lascaux during occupation (17,190 BP):</strong> Completely DRY cave. White calcite (CaCO₃) surfaces. NO active stalagmite/stalactite formation.</p>
                  <p><strong>Critical Geochronological Finding (Genty et al. 2011):</strong> The calcite gours (flowstone) that later protected the paintings formed between 9,530-6,635 years BP—<strong>thousands of years AFTER the art was created</strong>. This post-dates the paintings by 7,000+ years.</p>
                  <p><strong>Surface Preparation:</strong> Scraping to remove loose material. Some areas show preliminary charcoal sketches (radiocarbon datable).</p>
                  <p><strong>Topographic Integration:</strong> Artists deliberately selected wall features: convexities for animal shoulders, concavities for bellies, creating three-dimensional effects by incorporating natural rock contours.</p>
                  <p><strong>Temperature:</strong> Constant ~13°C. High humidity in some chambers.</p>`
      },
      3: {
        title: 'Technique-Material Relationships',
        content: `<p><strong>Experimental Archaeology (Lorblanchet 1990):</strong> Replication studies proved viability of blow/spray technique using hollow bird bones and liquid pigment mixed with saliva.</p>
                  <p><strong>BRUSH APPLICATION:</strong> Romanechite-based mixture. Tool: animal hair or plant fiber brushes. Effect: controlled strokes, crisp edges. Evidence: paint texture analysis shows brush marks in Great Bull chignon.</p>
                  <p><strong>BLOW/SPRAY TECHNIQUE:</strong> Hausmannite-based mixture. Tool: hollow bird bone or reed tube. Method: liquid paint + saliva, blown through tube ("spit-painting"). Effect: sharp edge one side, diffused on other (airbrushed effect). Evidence: Lorblanchet replication confirmed feasibility.</p>
                  <p><strong>ENGRAVING:</strong> Flint tools incising lines into soft calcite. Often combined with painting.</p>
                  <p><strong>FINGER APPLICATION:</strong> Direct application for filling large areas.</p>
                  <p><strong>Key Insight:</strong> Different mineral preparations were formulated for different techniques—demonstrating sophisticated technical knowledge during Solutrean-Badegoulian transition.</p>`
      },
      4: {
        title: 'Viewing Conditions: Lamplight Animation',
        content: `<p><strong>Archaeological Evidence:</strong> Red sandstone lamp dated to 17,000 BP found at Lascaux (now in National Prehistory Museum, Les Eyzies-de-Tayac).</p>
                  <p><strong>Fuel:</strong> Reindeer fat, horse fat, or bison fat (from hunted megafauna).</p>
                  <p><strong>Wick:</strong> Juniper twigs.</p>
                  <p><strong>Light characteristics:</strong> ~1500K color temperature (warm yellow). Flickering, dynamic illumination.</p>
                  <p><strong>Animation Effect:</strong> Flickering lamplight creates illusion of movement—animals appear to run, breathe, and shift as shadows move. This dynamic quality may have been intentional, integral to the ritual or cultural function of the art.</p>
                  <p><strong>Scaffolding:</strong> Holes in walls suggest wooden supports. Some paintings located 4+ meters above floor level, requiring constructed platforms or tree limbs.</p>
                  <p><strong>Acoustic Properties:</strong> Large chambers (Hall of Bulls, Axial Gallery) have echo effects—potential ritual significance.</p>
                  <p><strong>Complete Darkness:</strong> No natural light in painted chambers. All creation and viewing occurred by artificial lamplight.</p>`
      }
    };
    
    const transition = transitions[this.currentStage];
    
    if (transition) {
      document.getElementById('transitionTitle').textContent = transition.title;
      document.getElementById('transitionContent').innerHTML = transition.content;
      this.showScreen('transitionScreen');
    } else {
      this.continueFromTransition();
    }
  },
  
  // Continue from transition screen
  continueFromTransition() {
    this.currentStage++;
    this.updateProgress();
    
    switch(this.currentStage) {
      case 2:
        this.initStage2();
        break;
      case 3:
        this.initStage3();
        break;
      case 4:
        this.initStage4();
        break;
      case 5:
        this.initStage5();
        break;
    }
    
    this.showScreen(`stage${this.currentStage}`);
  },
  
  // Initialize Stage 2: Preparing Pigments
  initStage2() {
    const rawMaterialsDiv = document.getElementById('rawMaterials');
    rawMaterialsDiv.innerHTML = '';
    
    this.collectedMaterials.forEach((mineral, index) => {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'material-slot';
      slotDiv.draggable = true;
      slotDiv.dataset.materialType = mineral.type;
      slotDiv.innerHTML = `
        <div class="item-color" style="background-color: ${mineral.color};"></div>
        <span class="item-name" style="font-size: 0.85rem;">${mineral.name}</span>
      `;
      
      // Drag events
      slotDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
      slotDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));
      
      rawMaterialsDiv.appendChild(slotDiv);
    });
    
    // Setup mortar drop zone
    const mortar = document.getElementById('mortar');
    mortar.addEventListener('dragover', (e) => e.preventDefault());
    mortar.addEventListener('drop', (e) => this.handleDrop(e));
    mortar.addEventListener('mousedown', () => this.startGrinding());
    mortar.addEventListener('mouseup', () => this.stopGrinding());
    mortar.addEventListener('mouseleave', () => this.stopGrinding());
    
    // Touch support
    mortar.addEventListener('touchstart', (e) => { e.preventDefault(); this.startGrinding(); });
    mortar.addEventListener('touchend', (e) => { e.preventDefault(); this.stopGrinding(); });
  },
  
  // Drag and drop handlers
  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.dataTransfer.setData('material-type', e.target.dataset.materialType);
  },
  
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
  },
  
  handleDrop(e) {
    e.preventDefault();
    const materialType = e.dataTransfer.getData('material-type');
    
    if (!materialType || this.currentMaterialInMortar) return;
    
    const mineral = this.minerals[materialType];
    this.currentMaterialInMortar = { type: materialType, ...mineral };
    this.grindProgress = 0;
    
    document.getElementById('mortarContent').innerHTML = `
      <div style="text-align: center;">
        <div class="item-color" style="background-color: ${mineral.color}; width: 40px; height: 40px; margin: 0 auto 8px; border-radius: 50%;"></div>
        <p style="color: white; font-weight: 600; font-size: 0.9rem;">Click and hold to grind</p>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.75rem; margin-top: 4px;">${mineral.name}</p>
      </div>
    `;
    
    document.getElementById('mortar').classList.add('has-material');
  },
  
  // Grinding mechanics
  startGrinding() {
    if (!this.currentMaterialInMortar || this.isGrinding || this.grindProgress >= 100) return;
    
    this.isGrinding = true;
    document.getElementById('mortar').classList.add('grinding');
    
    this.grindInterval = setInterval(() => {
      this.grindProgress += 2;
      
      if (this.grindProgress >= 100) {
        this.grindProgress = 100;
        this.finishGrinding();
      }
      
      this.updateGrindProgress();
    }, 50);
  },
  
  stopGrinding() {
    this.isGrinding = false;
    document.getElementById('mortar').classList.remove('grinding');
    
    if (this.grindInterval) {
      clearInterval(this.grindInterval);
      this.grindInterval = null;
    }
  },
  
  updateGrindProgress() {
    const progressDiv = document.getElementById('grindProgress');
    progressDiv.innerHTML = `<div class="grind-progress-fill" style="width: ${this.grindProgress}%;"></div>`;
  },
  
  finishGrinding() {
    this.stopGrinding();
    
    const binder = document.getElementById('binderSelect').value;
    const paint = {
      ...this.currentMaterialInMortar,
      binder: binder
    };
    
    this.preparedPaints.push(paint);
    this.updatePreparedPaints();
    
    // Reset mortar
    this.currentMaterialInMortar = null;
    this.grindProgress = 0;
    document.getElementById('mortarContent').innerHTML = '<p class="hint">Drag another material here</p>';
    document.getElementById('mortar').classList.remove('has-material');
    this.updateGrindProgress();
    
    // Enable next if at least 2 paints prepared
    if (this.preparedPaints.length >= 2) {
      document.getElementById('stage2Next').disabled = false;
    }
    
    const binderText = binder === 'fat' ? 'animal fat (reindeer/horse/bison)' : binder === 'marrow' ? 'bone marrow' : 'cave water (Ca-rich)';
    const modalContent = `
      <p><strong>Preparation Complete:</strong></p>
      <p><strong>Mineral:</strong> ${paint.name}</p>
      <p><strong>Binder:</strong> ${binderText}</p>
      ${paint.technique ? `<p><strong>Appropriate for:</strong> ${paint.technique}</p>` : ''}
      <hr style="margin: 16px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
      <p>Ground to micron-scale particle size using stone mortar (shoulder blade) and pestle (hard limestone/quartzite). This preparation method documented through microscopic analysis of Lascaux pigments.</p>
    `;
    this.showInfoModal('Pigment Prepared', modalContent);
  },
  
  updatePreparedPaints() {
    const paintsDiv = document.getElementById('preparedPaints');
    paintsDiv.innerHTML = '';
    
    this.preparedPaints.forEach(paint => {
      const potDiv = document.createElement('div');
      potDiv.className = 'paint-pot';
      potDiv.innerHTML = `
        <div class="item-color" style="background-color: ${paint.color};"></div>
        <span class="item-name">${paint.name}</span>
      `;
      paintsDiv.appendChild(potDiv);
    });
  },
  
  // Initialize Stage 3: Cave Surface
  initStage3() {
    const wallAreas = document.querySelectorAll('.wall-area');
    wallAreas.forEach(area => {
      area.addEventListener('click', (e) => this.selectWallArea(e));
    });
  },
  
  selectWallArea(e) {
    if (this.currentStage !== 3) return;
    
    const area = e.target;
    const quality = area.dataset.quality;
    
    // Remove previous selection
    document.querySelectorAll('.wall-area').forEach(a => a.classList.remove('selected'));
    
    // Select new area
    area.classList.add('selected');
    this.selectedWallArea = quality;
    
    if (quality === 'smooth') {
      const modalContent = `
        <p><strong>Optimal calcite surface selected.</strong></p>
        <p><strong>Composition:</strong> White limestone calcite (CaCO₃)</p>
        <p><strong>Surface quality:</strong> Smooth, suitable for detailed work</p>
        <p><strong>Cave condition:</strong> Dry during occupation (no active calcite formation)</p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
        <p>Lascaux artists specifically selected smooth calcite areas for major compositions (Hall of Bulls, Axial Gallery). The natural wall topography was incorporated—convexities for shoulders, concavities for bellies—creating three-dimensional effects.</p>
        <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>Surface preparation: scraping with stone tools to remove loose material.</em></p>
      `;
      this.showInfoModal('Surface Analysis', modalContent);
      document.getElementById('stage3Next').disabled = false;
    } else {
      this.showInfoModal('Rough Surface', 'Rough calcite surface. While usable, Lascaux artists preferred smooth areas for detailed figurative art. Major compositions (Great Bull, Chinese horses) are on smooth calcite. Try selecting the center area.');
    }
  },
  
  // Initialize Stage 4: Painting
  initStage4() {
    const canvas = document.getElementById('paintCanvas');
    this.paintCtx = canvas.getContext('2d');
    
    // Set up canvas background
    this.paintCtx.fillStyle = '#8B7765';
    this.paintCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add texture
    this.addCaveTexture(this.paintCtx, canvas.width, canvas.height);
    
    // Setup color palette
    this.setupColorPalette();
    
    // Show initial template
    this.drawAnimalTemplate();
    
    // Canvas event listeners
    canvas.addEventListener('mousedown', (e) => this.startPainting(e));
    canvas.addEventListener('mousemove', (e) => this.paint(e));
    canvas.addEventListener('mouseup', () => this.stopPainting());
    canvas.addEventListener('mouseout', () => this.stopPainting());
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startPainting(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.paint(e.touches[0]); });
    canvas.addEventListener('touchend', () => this.stopPainting());
  },
  
  setupColorPalette() {
    const paletteDiv = document.getElementById('paintColors');
    paletteDiv.innerHTML = '';
    
    this.preparedPaints.forEach(paint => {
      const swatchContainer = document.createElement('div');
      swatchContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';
      
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = paint.color;
      swatch.dataset.color = paint.color;
      swatch.title = paint.name;
      
      const label = document.createElement('div');
      label.style.cssText = 'font-size: 0.7rem; color: var(--color-text-secondary); text-align: center; max-width: 60px; line-height: 1.2;';
      label.textContent = paint.name.split('(')[0].trim();
      
      if (paint.color === this.currentColor) {
        swatch.classList.add('active');
      }
      
      swatch.addEventListener('click', () => {
        this.currentColor = paint.color;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
      
      swatchContainer.appendChild(swatch);
      swatchContainer.appendChild(label);
      paletteDiv.appendChild(swatchContainer);
    });
  },
  
  addCaveTexture(ctx, width, height) {
    // Add subtle noise for cave wall texture
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
  },
  
  drawAnimalTemplate() {
    const canvas = document.getElementById('paintCanvas');
    const ctx = this.paintCtx;
    
    if (!this.templateVisible) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const templates = {
      horse: () => {
        // Horse - including famous "Chinese horses" in Axial Gallery
        ctx.beginPath();
        // Horse body
        ctx.ellipse(350, 250, 100, 60, 0, 0, Math.PI * 2);
        // Horse head
        ctx.moveTo(420, 230);
        ctx.quadraticCurveTo(480, 220, 490, 250);
        ctx.quadraticCurveTo(485, 270, 450, 265);
        // Neck
        ctx.moveTo(420, 230);
        ctx.lineTo(430, 210);
        ctx.lineTo(440, 230);
        // Legs
        ctx.moveTo(320, 310);
        ctx.lineTo(310, 380);
        ctx.moveTo(340, 310);
        ctx.lineTo(330, 380);
        ctx.moveTo(370, 310);
        ctx.lineTo(380, 380);
        ctx.moveTo(390, 310);
        ctx.lineTo(400, 380);
        // Tail
        ctx.moveTo(250, 245);
        ctx.quadraticCurveTo(220, 240, 210, 260);
        ctx.stroke();
      },
      aurochs: () => {
        // Aurochs (wild bull) - dominant species at Lascaux, especially in Hall of Bulls
        ctx.beginPath();
        // Bull body - larger and more massive
        ctx.ellipse(350, 260, 120, 70, 0, 0, Math.PI * 2);
        // Head
        ctx.moveTo(440, 240);
        ctx.quadraticCurveTo(500, 235, 510, 260);
        ctx.quadraticCurveTo(505, 285, 470, 280);
        // Horns
        ctx.moveTo(495, 245);
        ctx.quadraticCurveTo(510, 200, 500, 180);
        ctx.moveTo(505, 245);
        ctx.quadraticCurveTo(530, 210, 540, 190);
        // Neck hump
        ctx.moveTo(440, 230);
        ctx.quadraticCurveTo(430, 200, 410, 210);
        // Legs
        ctx.moveTo(310, 330);
        ctx.lineTo(300, 400);
        ctx.moveTo(340, 330);
        ctx.lineTo(330, 400);
        ctx.moveTo(380, 330);
        ctx.lineTo(390, 400);
        ctx.moveTo(410, 330);
        ctx.lineTo(420, 400);
        ctx.stroke();
      },
      deer: () => {
        ctx.beginPath();
        // Deer body - slender
        ctx.ellipse(350, 260, 90, 50, 0, 0, Math.PI * 2);
        // Head
        ctx.moveTo(420, 245);
        ctx.quadraticCurveTo(465, 240, 475, 260);
        ctx.quadraticCurveTo(470, 275, 445, 270);
        // Antlers
        ctx.moveTo(460, 245);
        ctx.lineTo(470, 200);
        ctx.moveTo(470, 210);
        ctx.lineTo(490, 195);
        ctx.moveTo(470, 220);
        ctx.lineTo(485, 210);
        // Neck
        ctx.moveTo(420, 240);
        ctx.lineTo(430, 220);
        // Legs - thinner
        ctx.moveTo(320, 310);
        ctx.lineTo(315, 380);
        ctx.moveTo(345, 310);
        ctx.lineTo(340, 380);
        ctx.moveTo(370, 310);
        ctx.lineTo(375, 380);
        ctx.moveTo(395, 310);
        ctx.lineTo(400, 380);
        // Tail
        ctx.moveTo(260, 255);
        ctx.lineTo(240, 270);
        ctx.stroke();
      },
      bison: () => {
        ctx.beginPath();
        // Bison body
        ctx.ellipse(350, 270, 110, 65, 0, 0, Math.PI * 2);
        // Large shoulder hump
        ctx.moveTo(400, 205);
        ctx.quadraticCurveTo(420, 190, 440, 205);
        ctx.quadraticCurveTo(445, 235, 430, 245);
        // Head - lower
        ctx.moveTo(445, 260);
        ctx.quadraticCurveTo(490, 270, 500, 295);
        ctx.quadraticCurveTo(490, 310, 465, 305);
        // Horns - curved
        ctx.moveTo(488, 280);
        ctx.quadraticCurveTo(505, 265, 500, 250);
        ctx.moveTo(495, 282);
        ctx.quadraticCurveTo(515, 270, 515, 255);
        // Legs
        ctx.moveTo(310, 335);
        ctx.lineTo(305, 400);
        ctx.moveTo(340, 335);
        ctx.lineTo(335, 400);
        ctx.moveTo(375, 335);
        ctx.lineTo(380, 400);
        ctx.moveTo(405, 335);
        ctx.lineTo(410, 400);
        // Beard
        ctx.moveTo(485, 305);
        ctx.lineTo(480, 325);
        ctx.stroke();
      }
    };
    
    if (templates[this.currentAnimal]) {
      templates[this.currentAnimal]();
    }
    
    ctx.restore();
  },
  
  changeTechnique() {
    this.currentTechnique = document.getElementById('techniqueSelect').value;
    
    const techniques = {
      brush: { 
        size: 8, 
        alpha: 0.7, 
        info: `<p><strong>Brush Application (Romanechite-based)</strong></p>
               <p><strong>Tool:</strong> Animal hair or plant fiber brushes</p>
               <p><strong>Paint consistency:</strong> Thicker mixture</p>
               <p><strong>Effect:</strong> Controlled strokes, crisp edges</p>
               <p><strong>Documented example:</strong> Great Bull chignon (between ears)</p>
               <p><strong>Mineral mixture:</strong> Romanechite + quartz + clay + iron oxide</p>
               <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>Chalmin et al. (2006). Paint texture analysis shows brush marks.</em></p>` 
      },
      spray: { 
        size: 25, 
        alpha: 0.3, 
        info: `<p><strong>Blow/Spray Technique (Hausmannite-based)</strong></p>
               <p><strong>Tool:</strong> Hollow bird bone or reed tube</p>
               <p><strong>Paint consistency:</strong> Liquid, mixed with saliva</p>
               <p><strong>Method:</strong> "Spit-painting"—blow through tube</p>
               <p><strong>Effect:</strong> Sharp edge one side, diffused other side (airbrushed)</p>
               <p><strong>Documented example:</strong> Great Bull muffle (snout)</p>
               <p><strong>Mineral mixture:</strong> Hausmannite + calcite + Fe-rich clays</p>
               <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>Lorblanchet (1990) experimental replication proved viability.</em></p>` 
      },
      finger: { 
        size: 15, 
        alpha: 0.6, 
        info: `<p><strong>Finger Application (Direct)</strong></p>
               <p><strong>Method:</strong> Direct application with fingers</p>
               <p><strong>Use:</strong> Bold marks, filling large areas</p>
               <p><strong>Evidence:</strong> Fingerprints preserved in some paint areas</p>
               <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>Common technique for broad coverage and expressive marks.</em></p>` 
      },
      engraving: { 
        size: 3, 
        alpha: 1.0, 
        info: `<p><strong>Engraving (Flint Tools)</strong></p>
               <p><strong>Tool:</strong> Flint implements</p>
               <p><strong>Method:</strong> Incising lines into soft calcite surface</p>
               <p><strong>Often combined:</strong> Engraving + painting for enhanced detail</p>
               <p><strong>Use:</strong> Defining contours, adding fine details</p>
               <p style="margin-top: 12px; font-size: 0.9em; color: #626C71;"><em>Many Lascaux animals combine engraving with pigment application.</em></p>` 
      }
    };
    
    const tech = techniques[this.currentTechnique];
    this.brushSize = tech.size;
    
    this.showInfoModal('Application Technique', tech.info);
  },
  
  changeAnimal() {
    this.currentAnimal = document.getElementById('animalSelect').value;
    
    // Show information about fauna selection
    const faunaInfo = {
      horse: `<p><strong>Horse (Equus caballus)</strong></p>
              <p>Horses are prominently depicted at Lascaux, especially the famous "Chinese horses" in the Axial Gallery, characterized by their distinctive belly profiles.</p>
              <p><strong>Technique:</strong> Combination of engraving and polychrome painting.</p>`,
      aurochs: `<p><strong>Aurochs (Bos primigenius) - Wild Bull</strong></p>
                <p>Dominant species in Hall of Bulls. The Great Bull measures ~5.2 meters—one of the largest prehistoric paintings known.</p>
                <p><strong>Analysis:</strong> Great Bull shows TWO different mineral preparations (romanechite/hausmannite) applied by different techniques on single animal.</p>
                <p style="margin-top: 8px; font-size: 0.9em; color: #626C71;"><em>Subject of Chalmin et al. (2006) micro-XANES study.</em></p>`,
      deer: `<p><strong>Red Deer/Cervids</strong></p>
             <p>Deer depicted with characteristic antlers. Less common than aurochs and horses but present in multiple chambers.</p>`,
      bison: `<p><strong>Bison</strong></p>
              <p>Depicted with characteristic shoulder humps and curved horns.</p>
              <p><strong>Mystery:</strong> Reindeer bones are abundant in occupation layers (primary food source), yet reindeer are NOT depicted in the art. This fauna-art disconnect is unexplained.</p>`
    };
    
    if (faunaInfo[this.currentAnimal]) {
      this.showInfoModal('Fauna Selection', faunaInfo[this.currentAnimal]);
    }
    
    // Redraw canvas with new template
    const canvas = document.getElementById('paintCanvas');
    this.paintCtx.fillStyle = '#8B7765';
    this.paintCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.addCaveTexture(this.paintCtx, canvas.width, canvas.height);
    this.drawAnimalTemplate();
  },
  
  showTemplate() {
    this.templateVisible = true;
    this.drawAnimalTemplate();
  },
  
  hideTemplate() {
    this.templateVisible = false;
    // Redraw without template
    const canvas = document.getElementById('paintCanvas');
    const imageData = this.paintCtx.getImageData(0, 0, canvas.width, canvas.height);
    this.paintCtx.fillStyle = '#8B7765';
    this.paintCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.addCaveTexture(this.paintCtx, canvas.width, canvas.height);
    this.paintCtx.putImageData(imageData, 0, 0);
  },
  
  startPainting(e) {
    this.isDrawing = true;
    this.paint(e);
  },
  
  paint(e) {
    if (!this.isDrawing) return;
    
    const canvas = document.getElementById('paintCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = this.paintCtx;
    
    if (this.currentTechnique === 'spray') {
      // Spray effect
      for (let i = 0; i < 10; i++) {
        const offsetX = (Math.random() - 0.5) * this.brushSize * 2;
        const offsetY = (Math.random() - 0.5) * this.brushSize * 2;
        ctx.fillStyle = this.currentColor + '40';
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = this.currentColor;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },
  
  stopPainting() {
    this.isDrawing = false;
  },
  
  clearCanvas() {
    const canvas = document.getElementById('paintCanvas');
    this.paintCtx.fillStyle = '#8B7765';
    this.paintCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.addCaveTexture(this.paintCtx, canvas.width, canvas.height);
    if (this.templateVisible) {
      this.drawAnimalTemplate();
    }
  },
  
  // Initialize Stage 5: Finishing
  initStage5() {
    const finishCanvas = document.getElementById('finishCanvas');
    this.finishCtx = finishCanvas.getContext('2d');
    
    // Copy painting from stage 4
    const paintCanvas = document.getElementById('paintCanvas');
    this.finishCtx.drawImage(paintCanvas, 0, 0);
  },
  
  addDetail(detailType) {
    const canvas = document.getElementById('finishCanvas');
    const ctx = this.finishCtx;
    
    ctx.fillStyle = '#1C1C1C';
    ctx.strokeStyle = '#1C1C1C';
    ctx.lineWidth = 3;
    
    switch(detailType) {
      case 'eyes':
        // Add eye details
        ctx.beginPath();
        ctx.arc(470, 250, 5, 0, Math.PI * 2);
        ctx.fill();
        this.showInfoModal('Eyes Added', '<p>Eyes emphasized to create life-like quality. Often depicted with particular attention to create connection with viewers.</p><p>Combination with engraved lines around eyes common at Lascaux.</p>');
        break;
      case 'horns':
        // Add horn highlights
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(500, 200);
        ctx.lineTo(495, 185);
        ctx.stroke();
        this.showInfoModal('Details Added', '<p>Horns and antlers carefully rendered to show specific species identification. Aurochs horns: large, forward-curved. Deer antlers: branching.</p><p>Often combined engraving + painting for enhanced three-dimensionality.</p>');
        break;
      case 'shading':
        // Add shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(350, 280, 90, 50, 0, 0, Math.PI);
        ctx.fill();
        this.showInfoModal('Shading Added', '<p>Shading creates depth and volume. Artists exploited natural wall topography—convex areas for shoulders/haunches, concave for bellies.</p><p>This topographic integration creates remarkable three-dimensional effects, especially visible under flickering lamplight.</p>');
        break;
    }
  },
  
  adjustLighting(value) {
    const canvas = document.getElementById('finishCanvas');
    const brightness = value / 100;
    canvas.style.filter = `brightness(${brightness}) sepia(${(100 - value) / 200})`;
    
    if (value < 50) {
      canvas.style.boxShadow = 'inset 0 0 50px rgba(0, 0, 0, ' + (1 - brightness) + ')';
    }
    
    // Show info about lamplight effects at specific brightness levels
    if (value < 40 && !this.lampInfoShown) {
      this.lampInfoShown = true;
      setTimeout(() => {
        this.showInfoModal('Lamplight Effect', '<p><strong>Authentic viewing conditions:</strong> Animal fat lamps (reindeer, horse, bison fat) with juniper wicks provide ~1500K warm yellow light.</p><p>Flickering illumination creates animation effect—animals appear to move, breathe, shift. This dynamic quality integral to the art\'s impact.</p><p><strong>Archaeological evidence:</strong> Red sandstone lamp, 17,000 BP, National Prehistory Museum.</p>');
      }, 500);
    }
  },
  
  // Complete game
  completeGame() {
    // Copy final artwork
    const finalCanvas = document.getElementById('finalArtwork');
    const finalCtx = finalCanvas.getContext('2d');
    const finishCanvas = document.getElementById('finishCanvas');
    finalCtx.drawImage(finishCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
    
    this.showScreen('completionScreen');
    document.getElementById('progressBar').style.display = 'none';
  },
  
  // Restart game
  restartGame() {
    // Reset all state
    this.currentStage = 0;
    this.collectedMaterials = [];
    this.preparedPaints = [];
    this.selectedWallArea = null;
    this.currentMaterialInMortar = null;
    this.grindProgress = 0;
    this.lampInfoShown = false;
    
    // Reset UI
    document.querySelectorAll('.clickable-area').forEach(area => area.classList.remove('collected'));
    document.querySelectorAll('.wall-area').forEach(area => area.classList.remove('selected'));
    document.getElementById('stage1Next').disabled = true;
    document.getElementById('stage2Next').disabled = true;
    document.getElementById('stage3Next').disabled = true;
    
    this.startGame();
  }
};

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  game.init();
});