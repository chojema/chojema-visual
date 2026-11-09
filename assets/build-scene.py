"""New-scene example; run with Blender, not a system Python interpreter."""
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(args) != 1:
    raise SystemExit("Usage: blender -b --factory-startup --python build-scene.py -- OUTPUT.blend")
output = Path(args[0]).resolve()
if output.suffix.lower() != ".blend" or output.exists():
    raise SystemExit("Use a new output path ending in .blend.")
output.parent.mkdir(parents=True, exist_ok=True)

# This example creates a new scene; never apply this reset to a user's existing scene.
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x, scene.render.resolution_y = 960, 540
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start, scene.frame_end = 1, 72
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.filepath = str(output.parent / "frames" / "frame_")

bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1.2))
hero = bpy.context.object
hero.name = "Hero"
bevel = hero.modifiers.new("Soft edges", "BEVEL")
bevel.width, bevel.segments = 0.12, 4
def node_tree(datablock):
    # Blender 5 creates node trees by default and deprecates use_nodes; older versions need it switched on.
    if datablock.node_tree is None:
        datablock.use_nodes = True
    return datablock.node_tree


def surface(name, color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color  # viewport only; renders read the shader below
    shader = next(n for n in node_tree(material).nodes if n.type == "BSDF_PRINCIPLED")
    shader.inputs["Base Color"].default_value = color
    return material


hero.data.materials.append(surface("Blue", (0.06, 0.25, 0.65, 1)))
# Linear keys ending one frame past frame_end give a constant spin that loops without a repeated frame.
bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
for frame, angle in ((scene.frame_start, 0), (scene.frame_end + 1, math.tau)):
    hero.rotation_euler[2] = angle
    hero.keyframe_insert(data_path="rotation_euler", frame=frame)

bpy.ops.mesh.primitive_plane_add(size=200)
floor = bpy.context.object
floor.name = "Floor"
floor.data.materials.append(surface("Floor gray", (0.16, 0.18, 0.22, 1)))

bpy.ops.object.camera_add(location=(6, -8, 5))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 1)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 50
scene.camera = camera
bpy.ops.object.light_add(type="AREA", location=(2, -4, 7))
light = bpy.context.object
light.data.energy, light.data.shape, light.data.size = 1200, "DISK", 5
light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat("-Z", "Y").to_euler()
world = bpy.data.worlds.new("World")
background = node_tree(world).nodes["Background"]
background.inputs[0].default_value = (0.16, 0.18, 0.22, 1)
background.inputs[1].default_value = 0.4
scene.world = world
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(output))
