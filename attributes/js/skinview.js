function initSkinViewer(skinURL, capeURL) {
    let skinViewer = new skinview3d.SkinViewer({
      canvas: document.getElementById("skin_container"),
      width: 250,
      height: 350,
      skin: skinURL
    })
    // Load a cape
    skinViewer.loadCape(capeURL)
    // Set the background to a panoramic image
    skinViewer.loadPanorama("../images/panorama.png")
    // Apply an animation
    skinViewer.animation = new skinview3d.WalkingAnimation()
    // Set the speed of the animation
    skinViewer.animation.speed = 0.3
  }