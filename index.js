/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Crawling Cursor component for A-Frame.
 */
AFRAME.registerComponent('crawling-cursor', {
    dependencies: ['raycaster'],
    schema: {
        target: {
            type: "selector"
        },
        offset: {
            // How far above the intersection point does the cursor hover? (Default 5cm)
            type: "number",
            default: 0.05,
        }
    },

    multiple: false,

    init: function() {
        if (this.data.target === null) {
            var cursor = document.querySelector("a-cursor");

            if (cursor === null) {
                console.warn("Please put a-cursor in a document");
                return;
            }

            this.data.target = cursor;
        }
    },

    tick: function () {
        var intersection = getNearestIntersection(this.el.components.raycaster.intersections, this.data);
        if (!intersection) { return; }

        // a matrix which represents item's movement, rotation and scale on global world
        var mat = intersection.object.matrixWorld;
        // remove parallel movement from the matrix
        mat.setPosition(new THREE.Vector3(0, 0, 0));

        // change local normal into global normal
        var global_normal = intersection.face.normal.clone().applyMatrix4(mat).normalize();

        // look at target coordinate = intersection coordinate + global normal vector
        var lookAtTarget = new THREE.Vector3().addVectors(intersection.point, global_normal);
        this.data.target.object3D.lookAt(lookAtTarget);

        // cursor coordinate = intersection coordinate + normal vector * offset
        var cursorPosition = new THREE.Vector3().addVectors(intersection.point, global_normal.multiplyScalar(this.data.offset));
        this.data.target.setAttribute("position", cursorPosition);

        function getNearestIntersection(intersections, data) {
            for (var i = 0, l = intersections.length; i < l; i++) {
                // ignore cursor itself to avoid flicker && ignore "ignore-ray" class
                if (data.target === intersections[i].object.el || intersections[i].object.el.classList.contains("ignore-ray")) { continue; }
                return intersections[i];
            }
            return null;
        }
    }
});