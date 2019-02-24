(function(){

  /* gather all h2s to create inpage nav */
  var section = document.querySelectorAll('h2');
  var sections = {};

  function setScrollSpyPositions(){
    Array.prototype.forEach.call(section, function(element, index) {
      var text = element.textContent;
      var id = element.id;
      var offset = 70;

      if ((document.body.scrollHeight - element.offsetTop) < window.innerHeight) {
        var bottomOffset = window.innerHeight - ( document.body.scrollHeight - element.offsetTop );
        if ( index === section.length - 1 ){
          offset = bottomOffset;
        }
        else {
          var previous = sections[section[index - 1].id];
          var current = element.offsetTop - bottomOffset;
          var average = (previous + current) / 2;
          offset = element.offsetTop - average;
        }
      }

      sections[id] = element.offsetTop - offset;
      addPageLink(text, id);
    });
  }

  window.addEventListener('resize', setScrollSpyPositions);
  window.addEventListener('load', setScrollSpyPositions);
  setScrollSpyPositions();

  window.onscroll = function() {
    var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

    for (i in sections) {
      if (sections[i] <= scrollPosition) {
        document.querySelector('.fg_is-active').classList.remove('fg_is-active');
        document.querySelector('a[href*=' + i + ']').classList.add('fg_is-active');
      }
    }
  };

  /* create in page nav link element and add to nav */
  function addPageLink(text, id){
    if (!document.querySelector('.fg_c_nav-page')){
      return;
    }

    var pageNavList = document.querySelector('.fg_c_nav-page__list');

    if (!pageNavList){
      var pageNav = document.querySelector('.fg_c_nav-page');
      pageNavList = document.createElement('ul');
      pageNavList.classList.add('fg_c_nav-page__list');
      pageNav.appendChild(pageNavList);
    }

    if (pageNavList.querySelector('a[href="#' + id + '"]')){
      return;
    }

    var item = document.createElement('li');
    item.classList.add('fg_c_nav-page__list-item');
    var link = document.createElement('a');

    if (text.indexOf(' ') !== -1 && text === 'API Tables'){
      text = text.substring(0, text.indexOf(' '));
    }

    link.textContent = text;
    link.setAttribute('title', text);
    link.setAttribute('href', '#' + id);
    link.classList.add('fg_c_nav-page__link');
    if (pageNavList.children.length === 0){
      link.classList.add('fg_is-active');
    }
    link.addEventListener('click', onPageLinkClick);
    item.appendChild(link);
    pageNavList.appendChild(item);
  }

  /* capture in page nav link click and trigger smooth scroll */
  function onPageLinkClick(event){
    event.preventDefault();
    var id = event.target.getAttribute('href').substring(1);
    var top = sections[id] - window.scrollY;
    window.scrollBy({ top: top, left: 0, behavior: 'smooth' });
  }

  window.onscroll = function() {
    var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    var pageNavList = document.querySelector('.fg_c_nav-page__list');

    if (!pageNavList) {
      return;
    }

    for (i in sections) {
      if (sections[i] <= scrollPosition) {
        pageNavList.querySelector('.fg_is-active').classList.remove('fg_is-active');
        pageNavList.querySelector('a[href*=' + i + ']').classList.add('fg_is-active');
      }
    }

  };

  // listen for demo switching
  var demoSelector = document.querySelector('.js-selector-demos');
  if ( demoSelector ) {
    demoSelector.addEventListener('change', function(event){
      const previous = document.querySelector('[class*="js-demo-"]:not(.fg_is-hidden)');
      previous.classList.add('fg_is-hidden');
      const current = document.querySelector('.js-demo-' + event.target.value);
      current.classList.remove('fg_is-hidden');
    });
  }

  // create resizeable previews
  var resizeables = Array.prototype.slice.call(document.querySelectorAll('.js-resize-preview'));
  resizeables.forEach(function(resizeable){

    var mask = document.createElement('div');
    mask.classList.add('fg_c_preview__event-mask', 'fg_is-hidden');
    resizeable.appendChild(mask);

    var handle = document.createElement('div');
    handle.classList.add('fg_c_preview__handle');
    resizeable.appendChild(handle);

    // Reset all preview sizes to 100% when the browser window is resized.
    window.addEventListener('resize', function(event) {
      var previewHandles = document.querySelectorAll('.fg_c_preview__handle');
      var i;

      for (i = 0; i < previewHandles.length; i++) {
        previewHandles[i].style.left = '';
      }

      var previewFrames = document.querySelectorAll('.fg_c_preview iframe');

      for (i = 0; i < previewFrames.length; i++) {
        previewFrames[i].style.width = '';
      }
    });

    handle.addEventListener('mousedown', function(event){

      var self = this;
      var iframe = this.parentElement.querySelector('iframe');
      var rect = this.getBoundingClientRect();
      var parentRect = this.parentElement.getBoundingClientRect();
      var leftBorder = 0;
      var offsetX = parentRect.left + ( event.clientX - rect.left );

      var mask = this.parentElement.querySelector('.fg_c_preview__event-mask');
      mask.classList.remove('fg_is-hidden');

      var onMouseMove = function(event){
        event.preventDefault();
        var xPos = event.clientX - offsetX;
        if (xPos <= leftBorder){
          xPos = leftBorder;
        }
        self.style.left = xPos + 'px';
        iframe.style.width = xPos + 'px';
      };

      var onMouseUp = function(){
        mask.classList.add('fg_is-hidden');
        document.body.removeEventListener('mousemove', onMouseMove);
        document.body.removeEventListener('mouseup', onMouseUp);
      };

      document.body.addEventListener('mousemove', onMouseMove);
      document.body.addEventListener('mouseup', onMouseUp);

    });

  });

  // create accordians
  var accordians = Array.prototype.slice.call(document.querySelectorAll('.js-accordian'));
  accordians.forEach(function(accordian){
    var buttons = Array.prototype.slice.call(accordian.querySelectorAll('[role="heading"]'));
    buttons.forEach(function(button){
      button.addEventListener('click', function(event){
        this.classList.toggle('fg_is-open');

        var content = this.nextElementSibling;
        if (content.classList.contains('fg_is-hidden')){
          content.classList.remove('fg_is-hidden');
          content.style.height = 0;
          content.style.overflow = 'hidden';
          setTimeout(function(){
            content.classList.add('toggle-transition');
            content.style.height = content.scrollHeight + 'px';
            content.addEventListener('transitionend', function onEnd(){
              content.classList.remove('toggle-transition');
              content.style.height = '';
              content.style.overflow = '';
              content.removeEventListener('transitionend', onEnd);
            });
          }, 16);
        }
        else {
          content.style.height = content.scrollHeight + 'px';
          setTimeout(function(){
            content.classList.add('toggle-transition');
            content.style.height = 0;
            content.style.overflow = 'hidden';
            content.addEventListener('transitionend', function onEnd(){
              content.classList.remove('toggle-transition');
              content.classList.add('fg_is-hidden');
              content.style.height = '';
              content.style.overflow = '';
              content.removeEventListener('transitionend', onEnd);
            });
          }, 16);
        }
      });
    });
  });

  // create tabs

  var onTabClick = function(event){
    event.preventDefault();
    if (!this.getAttribute('aria-selected')) {
      var previous = this.parentElement.querySelector('[aria-selected]');
      var previousIndex = Array.prototype.indexOf.call(this.parentElement.children, previous);

      var index = Array.prototype.indexOf.call(this.parentElement.children, this);
      var panels = Array.prototype.slice.call(this.parentElement.parentElement.querySelectorAll('[role="tabpanel"]'));
      var previousPanel = panels[previousIndex];
      var panel = panels[index];

      previous.removeAttribute('aria-selected');
      previousPanel.setAttribute('aria-hidden', 'true');

      this.setAttribute('aria-selected', 'true');
      panel.removeAttribute('aria-hidden');
    }
  };

  var tabContainers = Array.prototype.slice.call(document.querySelectorAll('.js-tabs'));
  tabContainers.forEach(function(tabContainer){

    var tabs = Array.prototype.slice.call(tabContainer.querySelectorAll('[role="tab"]'));
    tabs.forEach(function(tab, index){
      tab.addEventListener('click', onTabClick);
      if (index === 0) {
        tab.setAttribute('aria-selected', 'true');
      }
    });

    var tabPanels = Array.prototype.slice.call(tabContainer.querySelectorAll('[role="tabpanel"]'));
    tabPanels.forEach(function(tabPanel, index){
      if (index > 0) {
        tabPanel.setAttribute('aria-hidden', 'true');
      }
    });

  });

  if (document.querySelector('.js-copy-code')){
    new Clipboard('.js-copy-code');
  }

  /* TODO :: Include Amplitude
  clipboard.on('success', function(e) {
    amplitude.getInstance().logEvent('copied code ' + e.trigger.dataset.clipboardTarget);
  });

  clipboard.on('error', function(e) {
    amplitude.getInstance().logEvent('copy error ' + e.trigger.dataset.clipboardTarget);
  });
  */

  var hero = document.querySelector('.js-hero');
  if(hero){

    var MESH = {
      width: 1.2,
      height: 1.2,
      depth: 3,
      segments: 10,
      slices: 5,
      xRange: 0.3,
      yRange: 0.3,
      zRange: 0.8,
      ambient: '#1f1f1f',
      diffuse: '#4997A5',
      speed: 0.0003
    };

    var LIGHT = {
      count: 2,
      zOffset: 150,
      ambient: '#9F00EB',
      diffuse: '#dddddd',
      maxSpeed: 25,
      maxForce: 2,
      angle: 0,
      radius: 10,
      draw: false,
      // attractor
      autopilot: true,
      bounds: FSS.Vector3.create(),
      xyScalar: 0.75,
      speed: 0.0005,
      step: FSS.Vector3.create(
        1,
        0.5,
        0
      )
    };

    var now, start = Date.now();
    var center = FSS.Vector3.create();
    var attractor = FSS.Vector3.create();
    var renderer, scene, mesh, geometry, material;
    /* debug attractor */
    var att = document.createElement('div');
    hero.appendChild(att);

    console.log(FSS.Vector3);

    function initialise() {
      createRenderer();
      createScene();
      createMesh();
      createLights();
      addEventListeners();
      resize(hero.offsetWidth, hero.offsetHeight);
      animate();
    }

    function createRenderer(){
      renderer = new FSS.WebGLRenderer();
      renderer.setSize(hero.offsetWidth, hero.offsetHeight);
      hero.appendChild(renderer.element);
    };

    function createScene(){
      scene = new FSS.Scene();
    };

    function createMesh(){
      scene.remove(mesh);
      renderer.clear();
      geometry = new FSS.Plane(MESH.width * renderer.width, MESH.height * renderer.height, MESH.segments, MESH.slices);
      material = new FSS.Material(MESH.ambient, MESH.diffuse);
      mesh = new FSS.Mesh(geometry, material);
      scene.add(mesh);

      // Augment vertices for animation
      var v, vertex;
      for (v = geometry.vertices.length - 1; v >= 0; v--) {
        vertex = geometry.vertices[v];
        vertex.anchor = FSS.Vector3.clone(vertex.position);
        vertex.step = FSS.Vector3.create(
          Math.randomInRange(0.2, 1.0),
          Math.randomInRange(0.2, 1.0),
          Math.randomInRange(0.2, 1.0)
        );
        vertex.time = Math.randomInRange(0, Math.PIM2);
      }
    };

    function createLights(){
      var l, light;
      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l];
        scene.remove(light);
      }

      renderer.clear();
      for (l = 0; l < LIGHT.count; l++) {
        light = new FSS.Light(LIGHT.ambient, LIGHT.diffuse);
        light.ambientHex = light.ambient.format();
        light.diffuseHex = light.diffuse.format();
        light.position = FSS.Vector3.create(0, 0, LIGHT.zOffset);
        scene.add(light);

        // Augment light for animation
        light.velocity = FSS.Vector3.create();
        light.acceleration = FSS.Vector3.create();
        light.desired = FSS.Vector3.create();
        light.steer = FSS.Vector3.create();

        light.angle = (( Math.PI * 2 ) / LIGHT.count ) * l;
        light.rotationSpeed = Math.randomInRange(0.03, 0.08);
        light.rotate = FSS.Vector3.create();

        // place imposter for debugging
        var imposter = document.createElement('div');
        hero.appendChild(imposter);
        light.imposter = imposter;

      }
    };

    function addEventListeners() {
      window.addEventListener('resize', onWindowResize);
      hero.addEventListener('mouseenter', onMouseEnter);
      hero.addEventListener('mouseleave', onMouseLeave);
      hero.addEventListener('mousemove', onMouseMove);
      document.addEventListener('keydown', onKeyDown);
    }

    function onMouseEnter(event) {
      LIGHT.autopilot = false;
    }

    function onMouseLeave(event) {
      LIGHT.autopilot = true;
    }

    function onKeyDown(event) {
      if(event.key === 'd'){
        if(LIGHT.draw){
          LIGHT.draw = false;
          att.classList.remove('attractor');
          var l, lx, ly, light;
          for (l = scene.lights.length - 1; l >= 0; l--) {
            light = scene.lights[l];
            light.imposter.classList.remove('light');
          }
        } else {
          LIGHT.draw = true;
          att.classList.add('attractor');
          var l, lx, ly, light;
          for (l = scene.lights.length - 1; l >= 0; l--) {
            light = scene.lights[l];
            light.imposter.classList.add('light');
          }
        }
      }
    }

    function onMouseMove(event) {
      var top = ( event.currentTarget.offsetTop + renderer.height ) - event.pageY;
      var left = event.pageX - event.currentTarget.offsetLeft;
      FSS.Vector3.set(attractor, left, top);
      FSS.Vector3.subtract(attractor, center);
    }

    function onWindowResize(event) {
      resize(hero.offsetWidth, hero.offsetHeight);
      render();
    }

    function resize(width, height) {
      renderer.setSize(width, height);
      FSS.Vector3.set(center, renderer.halfWidth, renderer.halfHeight);
      createMesh();
    }

    function animate() {
      now = Date.now() - start;
      update();
      render();
      requestAnimationFrame(animate);
    }

    function convertRange( value, r1, r2 ) {
        return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
    }

    function update() {
      var ox, oy, oz, l, light, v, vertex, offset = MESH.depth/2;

      // Update Bounds
      FSS.Vector3.copy(LIGHT.bounds, center);
      FSS.Vector3.multiplyScalar(LIGHT.bounds, LIGHT.xyScalar);

      // Update Attractor
      FSS.Vector3.setZ(attractor, LIGHT.zOffset);

      // Overwrite the Attractor position
      if (LIGHT.autopilot) {
        ox = Math.sin(LIGHT.step[0] * now * LIGHT.speed);
        oy = Math.cos(LIGHT.step[1] * now * LIGHT.speed);
        FSS.Vector3.set(attractor,
          LIGHT.bounds[0]*ox,
          LIGHT.bounds[1]*oy,
          LIGHT.zOffset);
      }

      // Animate Lights
      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l];

        // Reset the z position of the light
        FSS.Vector3.setZ(light.position, LIGHT.zOffset);

        FSS.Vector3.subtractVectors(light.desired, attractor, light.position);
        var distance = FSS.Vector3.length(light.desired);
        FSS.Vector3.normalise(light.desired);
        if(distance < 200){
          var speed = convertRange( distance, [ 1, 200 ], [ 0, LIGHT.maxSpeed ] );
          FSS.Vector3.multiplyScalar(light.desired, speed);
        } else {
          FSS.Vector3.multiplyScalar(light.desired, LIGHT.maxSpeed);
        }
        FSS.Vector3.subtractVectors(light.steer, light.desired, light.velocity);
        FSS.Vector3.limit(light.steer, 0, LIGHT.maxForce);
        FSS.Vector3.add(light.acceleration, light.steer);

        FSS.Vector3.add(light.velocity, light.acceleration);
        FSS.Vector3.limit(light.velocity, 0, LIGHT.maxSpeed);
        FSS.Vector3.add(light.position, light.velocity);

        light.angle += light.rotationSpeed;
        var x = Math.sin(light.angle);
        var y = Math.cos(light.angle);
        FSS.Vector3.set(light.rotate, x, y);
        FSS.Vector3.normalise(light.rotate);
        FSS.Vector3.multiplyScalar(light.rotate, LIGHT.radius);

        FSS.Vector3.add(light.position, light.rotate);

        FSS.Vector3.set(light.acceleration);


      }

      // Animate Vertices
      for (v = geometry.vertices.length - 1; v >= 0; v--) {
        vertex = geometry.vertices[v];
        ox = Math.sin(vertex.time + vertex.step[0] * now * MESH.speed);
        oy = Math.cos(vertex.time + vertex.step[1] * now * MESH.speed);
        oz = Math.sin(vertex.time + vertex.step[2] * now * MESH.speed);
        FSS.Vector3.set(vertex.position,
          MESH.xRange*geometry.segmentWidth*ox,
          MESH.yRange*geometry.sliceHeight*oy,
          MESH.zRange*offset*oz - offset);
        FSS.Vector3.add(vertex.position, vertex.anchor);
      }

      // Set the Geometry to dirty
      geometry.dirty = true;
    }

    function render() {
      renderer.render(scene);

      if (LIGHT.draw) {
        var l, lx, ly, light;
        for (l = scene.lights.length - 1; l >= 0; l--) {
          light = scene.lights[l];
          lx = light.position[0];
          ly = light.position[1];
          light.imposter.style.top = (center[1] - ly) + 'px';
          light.imposter.style.left = (lx + center[0]) + 'px';
        }
        att.style.top = (center[1] - attractor[1]) + 'px';
        att.style.left = (attractor[0] + center[0]) + 'px';
      }
    }

    initialise();
  }

  // pretty print any debug content that shows up
  var debug = document.querySelectorAll('.debug pre code');
  Array.prototype.forEach.call(debug, function(el){
    el.textContent = JSON.stringify(JSON.parse(el.textContent), null, 2);
  });

}());
