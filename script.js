
(() => {
  const mount = document.getElementById("game");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x91b8d1);
  scene.fog = new THREE.Fog(0x91b8d1, 38, 115);

  const camera = new THREE.PerspectiveCamera(
    65, innerWidth / innerHeight, 0.1, 250
  );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

mount.appendChild(renderer.domElement);

scene.add(
  new THREE.HemisphereLight(0xc8d9ed, 0x51402e, 1.35)
);

const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffd29a, 2.5);

sun.position.set(-20, 35, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);

sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 28;
sun.shadow.camera.bottom = -28;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0004;

scene.add(sun);

  
  const mat = (color, roughness = 0.9) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const stone = mat(0x9a8972);
  const paleStone = mat(0xc0ad8e);
  const darkStone = mat(0x655c52);
  const red = mat(0x8e2529);
  const gold = mat(0xd9ad53, 0.4);
  const green = mat(0x355c43);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    mat(0x65734d)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.15;
  ground.receiveShadow = true;
  scene.add(ground);

  function box(parent, w, h, d, material, x, y, z) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), material
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function dome(parent, x, y, z, r, material) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(
        r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2
      ),
      material
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }

  function tower(parent, x, z, h = 5) {
    box(parent, 2, h, 2, paleStone, x, h / 2, z);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 2, 8), red
    );
    roof.position.set(x, h + 1, z);
    roof.castShadow = true;
    parent.add(roof);

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.8, 8), gold
    );
    tip.position.set(x, h + 2.3, z);
    parent.add(tip);
  }

  function building(x, z, w = 8, d = 7, h = 5) {
    const g = new THREE.Group();
    scene.add(g);

    box(g, w, h, d, stone, x, h / 2, z);
    box(g, w + 0.3, 0.3, d + 0.3, darkStone, x, h, z);

    for (let i = 0; i < Math.floor(w / 2.5); i++) {
      box(
        g, 0.65, 1.5, 0.12, darkStone,
        x - w / 2 + 1.3 + i * 2.2, 1.7, z - d / 2 - 0.07
      );
    }

    if (Math.random() > 0.4) {
      dome(g, x, h + 0.1, z, Math.min(w, d) * 0.3, green);
      tower(g, x - w * 0.32, z, h + 1.2);
    }
  }

  for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 100;
    const z = -25 - Math.random() * 60;
    building(
      x, z,
      5 + Math.random() * 5,
      5 + Math.random() * 5,
      3 + Math.random() * 5
    );
  }

  box(scene, 30, 5, 1.3, stone, 0, 2.5, -14);
  box(scene, 1.3, 5, 22, stone, -15, 2.5, -3);
  box(scene, 1.3, 5, 22, stone, 15, 2.5, -3);

  tower(scene, -14, -14, 6);
  tower(scene, 14, -14, 6);

  box(scene, 7, 5, 1.5, paleStone, 0, 2.5, -14);
  box(scene, 3.2, 3.5, 1.7, darkStone, 0, 1.75, -13.8);
  box(scene, 7, 0.08, 38, mat(0xa99a7d), 0, -0.04, 4);

  function makeWarrior(isPlayer) {
    const g = new THREE.Group();
    const cloth = isPlayer ? red : green;
    const skin = mat(0xc89165);
    const boots = mat(0x352b27);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.55, 1.25, 8), cloth
    );
    body.position.y = 1.35;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10), skin
    );
    head.position.y = 2.25;
    head.castShadow = true;
    g.add(head);

    const turban = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 8),
      isPlayer ? gold : paleStone
    );
    turban.scale.set(1, 0.55, 1);
    turban.position.y = 2.48;
    g.add(turban);

    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.17, 0.75, 8), cloth
      );
      arm.position.set(side * 0.48, 1.45, 0);
      arm.rotation.z = side * -0.22;
      g.add(arm);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.17, 0.65, 8), boots
      );
      leg.position.set(side * 0.22, 0.45, 0);
      g.add(leg);
    }

    const sword = new THREE.Group();
    sword.position.set(0.57, 1.5, -0.03);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.85, 0.12), gold
    );
    blade.position.y = 0.48;
    sword.add(blade);

    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.23, 0.18), boots
    );
    grip.position.y = -0.02;
    sword.add(grip);

    g.add(sword);
    g.userData.sword = sword;
    scene.add(g);
    return g;
  }

  const player = makeWarrior(true);
  player.position.set(0, 0, 5);

  const enemies = [];

  for (let i = 0; i < 6; i++) {
    const e = makeWarrior(false);
    e.position.set((i % 3 - 1) * 5, 0, -3 - Math.floor(i / 3) * 6);
    e.rotation.y = Math.PI;
    e.userData.hp = 2;
    e.userData.cooldown = 0;
    enemies.push(e);
  }

  const keys = {};
  let health = 100;
  let score = 0;
  let vy = 0;
  let onGround = true;
  let attackTimer = 0;

  const playerSpeed = 9;

  document.querySelectorAll("[data-key]").forEach(b => {
    const k = b.dataset.key;

    b.addEventListener("pointerdown", e => {
      e.preventDefault();
      keys[k] = true;
      if (b.setPointerCapture) b.setPointerCapture(e.pointerId);
    });

    for (const ev of [
      "pointerup", "pointercancel", "lostpointercapture"
    ]) {
      b.addEventListener(ev, e => {
        e.preventDefault();
        keys[k] = false;
      });
    }
  });

  addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    keys[k] = true;

    if ([
      "arrowup", "arrowdown", "arrowleft", "arrowright", " "
    ].includes(k)) e.preventDefault();

    if (k === "j" && !e.repeat) attack();
    if (k === " " && !e.repeat) jump();
  });

  addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  function jump() {
    if (onGround) {
      vy = 8;
      onGround = false;
    }
  }

  function attack() {
    if (attackTimer > 0 || health <= 0) return;

    attackTimer = 0.42;
    player.userData.sword.rotation.z = -1.5;

    let target = null;
    let dist = 3.5;

    enemies.forEach(e => {
      if (e.userData.hp <= 0) return;

      const d = player.position.distanceTo(e.position);
      if (d < dist) {
        dist = d;
        target = e;
      }
    });

    if (target) {
      target.userData.hp--;

      target.position.x +=
        (target.position.x - player.position.x) * 0.16;
      target.position.z +=
        (target.position.z - player.position.z) * 0.16;

      if (target.userData.hp <= 0) {
        scene.remove(target);
        score++;
        document.getElementById("score").textContent = score;

        document.getElementById("message").textContent =
          score === 6
            ? "Victory! The courtyard is yours!"
            : "Enemy guard defeated!";
      }
    }
  }

  let last = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min((now - last) / 1000, 0.04);
    last = now;

    let dx = 0, dz = 0;

    if (keys.arrowleft || keys.a || keys.left) dx -= 1;
    if (keys.arrowright || keys.d || keys.right) dx += 1;
    if (keys.arrowup || keys.w || keys.up) dz -= 1;
    if (keys.arrowdown || keys.s || keys.down) dz += 1;

    if ((dx || dz) && health > 0) {
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;

      player.position.x += dx * playerSpeed * dt;
      player.position.z += dz * playerSpeed * dt;
      player.rotation.y = Math.atan2(dx, dz) + Math.PI;
    }

    if (keys.jump) jump();
    if (keys.attack) attack();

    vy -= 19 * dt;
    player.position.y += vy * dt;

    if (player.position.y <= 0) {
      player.position.y = 0;
      vy = 0;
      onGround = true;
    }

    attackTimer = Math.max(0, attackTimer - dt);

    if (attackTimer === 0) {
      player.userData.sword.rotation.z = 0;
    }

    enemies.forEach(e => {
      if (e.userData.hp <= 0 || health <= 0) return;

      const d = e.position.distanceTo(player.position);

      if (d < 11 && d > 1.7) {
        const dir = player.position.clone()
          .sub(e.position).normalize();

        e.position.addScaledVector(dir, dt * 1.1);
        e.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
      } else if (d <= 1.7) {
        e.userData.cooldown -= dt;

        if (e.userData.cooldown <= 0) {
          health = Math.max(0, health - 5);
          document.getElementById("health").textContent = health;
          e.userData.cooldown = 1.1;

          if (health === 0) {
            document.getElementById("message").textContent =
              "You have fallen! Refresh the page to restart.";
          }
        }
      }
    });

    const desired = new THREE.Vector3(
      player.position.x,
      player.position.y + 6,
      player.position.z + 10
    );

    camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.lookAt(
      player.position.x,
      player.position.y + 1.2,
      player.position.z - 1
    );

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
