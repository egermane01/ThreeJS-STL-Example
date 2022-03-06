import * as THREE from "three"
import { STLLoader } from "stl-loader"
import { GUI } from "gui"
import { OrbitControls } from "orbit-controls"
import { URL, PORT } from "./env.js"

// let objectFile = ""
let container, camera, cameraTarget, scene, renderer, group, controls, mesh
let formData = new FormData()

let serverConfig = {
    ip: URL + ":" + PORT,
    url: "http://localhost:" + PORT,
}

const addShadowedLight = (x, y, z, color, intensity) => {
    const directionalLight = new THREE.DirectionalLight(color, intensity)
    directionalLight.position.set(x, y, z)
    scene.add(directionalLight)

    directionalLight.castShadow = true

    const d = 1
    directionalLight.shadow.camera.left = -d
    directionalLight.shadow.camera.right = d
    directionalLight.shadow.camera.top = d
    directionalLight.shadow.camera.bottom = -d

    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 4

    directionalLight.shadow.bias = -0.002
}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

const render = () => {
    camera.lookAt(cameraTarget)

    renderer.render(scene, camera)
}

const createCamera = () => {
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 2, 4)

    cameraTarget = new THREE.Vector3(0, -0.5, -0.6)
}

const createRenderer = () => {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding

    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
}

const createScene = () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000)
    scene.add(new THREE.HemisphereLight(0x443333, 0x111122))
}

const loadObject = () => {
    const loader = new STLLoader()
    loader.load("./uploads/screw.stl", function (geometry) {
        group = new THREE.Group()
        scene.add(group)

        const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 })
        mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 0, 0)
        mesh.scale.set(10, 10, 10)
        mesh.castShadow = true
        mesh.receiveShadow = true

        geometry.center()
        group.add(mesh)
    })
}

const createGUI = () => {
    let guiEvents = {
        spinRight: function (e) {
            group.rotation.y -= 0.25
            controls.update()
        },
        spinLeft: function () {
            group.rotation.y += 0.25
            controls.update()
        },
        forward: function () {
            group.rotation.x -= 0.25
            controls.update()
        },
        backward: function () {
            group.rotation.x += 0.25
            controls.update()
        },
        right: function () {
            group.rotation.z += 0.25
            controls.update()
        },
        left: function () {
            group.rotation.z -= 0.25
            controls.update()
        },
    }

    let gui = new GUI()

    const guiConfig = [
        {
            name: "SpinRight",
            functionKey: "spinRight",
        },
        {
            name: "SpinLeft",
            functionKey: "spinLeft",
        },
        {
            name: "Forward",
            functionKey: "forward",
        },
        {
            name: "Backward",
            functionKey: "backward",
        },
        {
            name: "Right",
            functionKey: "right",
        },
        {
            name: "Left",
            functionKey: "left",
        },
    ]

    guiConfig.forEach(config => {
        gui.add(guiEvents, config.functionKey).name(config.name)
    })
}

const init = () => {
    container = document.createElement("div")
    document.body.appendChild(container)

    createCamera()
    createScene()
    loadObject()
    createGUI()
    createRenderer()

    addShadowedLight(1, 1, 1, 0xffffff, 1.35)
    addShadowedLight(0.5, 1, -1, 0xffaa00, 1)

    controls = new OrbitControls(camera, renderer.domElement)

    window.addEventListener("resize", onWindowResize)
}

//EVENT HANDLERS

const handleFiles = event => {
    formData.append("objectFile", document.getElementById("image-file").files[0]) /* now you can work with the file list */
}

const submitLogo = () => {
    const url = serverConfig.url + "/upload"
    axios.post(url, formData).then(res => {
        console.log(res)
        document.getElementById("logo").src = serverConfig.ip + "/avatar?avatar=" + res.data.data
    })
    formData = new FormData()
}

const downloadScreen = () => {
    domtoimage.toJpeg(document.body).then(function (dataUrl) {
        console.log(domtoimage)
        var link = document.createElement("a")
        link.download = "my-image-name.jpeg"
        link.href = dataUrl
        link.click()
    })
}

const pickColor = e => {
    scene.background = new THREE.Color(e.target.value)
}

const eventHandlersConfig = [
    {
        elementId: "image-file",
        eventType: "change",
        callbackFunction: handleFiles,
    },
    {
        elementId: "logo-button",
        eventType: "click",
        callbackFunction: submitLogo,
    },
    {
        elementId: "screenshot",
        eventType: "click",
        callbackFunction: downloadScreen,
    },
    {
        elementId: "color-picker",
        eventType: "input",
        callbackFunction: pickColor,
    },
    // {
    //     elementId: "submit-button",
    //     eventType: "click",
    //     callbackFunction: submitFile,
    // },
]

eventHandlersConfig.forEach(config => {
    document.getElementById(config.elementId).addEventListener(config.eventType, config.callbackFunction, false)
})

// commented out because, couldn't get the stl file properly
// function submitFile(event) {
//     const url = serverConfig.url + "/upload"
//     axios.post(url, formData).then(res => {
//         axios.get("http://192.168.0.17:3001/avatar?avatar=" + res.data.data).then(response => {
//             objectFile = response.data
//             console.log(objectFile, response)
//         })
//     })
//     formData = new FormData()
//     init()
// }

init()
animate()
