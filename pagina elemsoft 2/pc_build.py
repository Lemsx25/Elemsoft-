"""
PC_Build.py — Generador automático de un PC Gamer blanco "estilo pecera"
con vidrio templado e iluminación RGB arcoíris, usando la API bpy de Blender.

Cómo ejecutarlo:
1. Abre Blender (probado en 4.0).
2. Ve a la pestaña "Scripting".
3. Abre este archivo (Open) o pega su contenido en un Text Block nuevo.
4. Presiona "Run Script" (▶) o Alt+P.
5. Todo el ensamble aparece organizado dentro de la colección "PC_Build".

Anatomía / proporciones usadas (basadas en specs reales de un ensamble ATX):
- Gabinete: 21 (ancho) x 45 (profundidad) x 45 (alto) cm — proporción real
  de un mid-tower (el ancho solo da holgura para el cooler; alto y
  profundidad son casi iguales y mucho mayores que el ancho).
- Motherboard ATX: 30.5 x 24.4 cm, montada de pie contra la pared izquierda
  (el plano de la placa es perpendicular al ancho del gabinete).
- El resto de las piezas (CPU, cooler, RAM, GPU, PSU, fans) se ubican según
  su posición real relativa a la placa y al gabinete.
"""

import bpy
import math

# ============================================================
# 0. CONFIG / HELPERS DE UNIDADES
# ============================================================
CM = 0.01  # Blender trabaja en metros; esto convierte cm -> m


def cm(v):
    return v * CM


# Dimensiones externas del gabinete (cm)
CASE_W = 21.0   # ancho           (eje X)
CASE_D = 45.0   # profundidad     (eje Y, frente-atrás)
CASE_H = 45.0   # alto            (eje Z)

PANEL_T = 0.4   # grosor de paneles


# ============================================================
# 1. LIMPIEZA DE ESCENA
# ============================================================
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block_collection in (bpy.data.meshes, bpy.data.materials,
                              bpy.data.cameras, bpy.data.lights,
                              bpy.data.collections):
        for block in list(block_collection):
            if block.users == 0:
                block_collection.remove(block)


clear_scene()

# ============================================================
# 2. COLECCIÓN PRINCIPAL "PC_Build" + sub-colecciones
# ============================================================
PC_BUILD = bpy.data.collections.new("PC_Build")
bpy.context.scene.collection.children.link(PC_BUILD)

SUB = {}
for sub_name in ["Case", "Motherboard", "Cooling", "Memory_Storage",
                  "GPU", "PSU", "Fans"]:
    c = bpy.data.collections.new(sub_name)
    PC_BUILD.children.link(c)
    SUB[sub_name] = c


def link(obj, sub):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    SUB[sub].objects.link(obj)
    return obj


# ============================================================
# 3. MATERIALES
# ============================================================
def set_input(bsdf, names, value):
    """Prueba varios nombres de socket posibles (compatibilidad 3.x / 4.x)."""
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = value
            return True
    return False


def new_principled(name, color, metallic=0.0, roughness=0.5,
                    transmission=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    set_input(bsdf, ["Metallic"], metallic)
    set_input(bsdf, ["Roughness"], roughness)
    if transmission > 0:
        set_input(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_input(bsdf, ["Roughness"], min(roughness, 0.05))
        set_input(bsdf, ["IOR"], 1.45)
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'BLEND'
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'BLEND'
    return mat


def new_glass(name, color, alpha=0.12):
    """Vidrio simplificado vía alpha (más confiable en Eevee que transmission)."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    set_input(bsdf, ["Metallic"], 0.0)
    set_input(bsdf, ["Roughness"], 0.05)
    bsdf.inputs["Alpha"].default_value = alpha
    if hasattr(mat, "blend_method"):
        mat.blend_method = 'BLEND'
    if hasattr(mat, "shadow_method"):
        mat.shadow_method = 'NONE'
    return mat


def new_rainbow_emission(name, strength=6.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    emi = nodes.new("ShaderNodeEmission")
    ramp = nodes.new("ShaderNodeValToRGB")
    grad = nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = 'RADIAL'
    coord = nodes.new("ShaderNodeTexCoord")

    cr = ramp.color_ramp
    cr.interpolation = 'LINEAR'
    stops = [
        (0.00, (1.0, 0.0, 0.0, 1)),
        (0.16, (1.0, 0.5, 0.0, 1)),
        (0.33, (1.0, 1.0, 0.0, 1)),
        (0.50, (0.0, 1.0, 0.0, 1)),
        (0.66, (0.0, 0.5, 1.0, 1)),
        (0.83, (0.5, 0.0, 1.0, 1)),
        (1.00, (1.0, 0.0, 0.6, 1)),
    ]
    cr.elements[0].position = stops[0][0]
    cr.elements[0].color = stops[0][1]
    cr.elements[1].position = stops[-1][0]
    cr.elements[1].color = stops[-1][1]
    for pos, col in stops[1:-1]:
        e = cr.elements.new(pos)
        e.color = col

    links.new(coord.outputs["Generated"], grad.inputs["Vector"])
    links.new(grad.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], emi.inputs["Color"])
    emi.inputs["Strength"].default_value = strength
    links.new(emi.outputs["Emission"], out.inputs["Surface"])
    return mat


MAT_WHITE      = new_principled("Mat_Case_White",  (0.92, 0.92, 0.92), metallic=0.0, roughness=0.35)
MAT_GLASS      = new_glass("Mat_Glass", (0.85, 0.92, 1.00), alpha=0.12)
MAT_DARK_METAL = new_principled("Mat_Dark_Metal",  (0.03, 0.03, 0.03), metallic=0.6, roughness=0.4)
MAT_PCB        = new_principled("Mat_PCB_Black",   (0.02, 0.02, 0.02), metallic=0.1, roughness=0.6)
MAT_BLADE      = new_principled("Mat_Fan_Blade",   (0.85, 0.90, 1.00), metallic=0.0, roughness=0.05, transmission=0.85, alpha=0.35)
MAT_RAINBOW    = new_rainbow_emission("Mat_RGB_Rainbow", strength=6.0)
MAT_RAM_RGB    = new_rainbow_emission("Mat_RAM_RGB", strength=4.0)


# ============================================================
# 4. HELPERS DE GEOMETRÍA
# ============================================================
def add_box(name, dx, dy, dz, x, y, z, mat, sub):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cm(x), cm(y), cm(z)))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (cm(dx), cm(dy), cm(dz))
    if mat:
        obj.data.materials.append(mat)
    return link(obj, sub)


def add_cylinder(name, radius, depth, x, y, z, mat, sub, axis='Z', verts=32):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=cm(radius), depth=cm(depth), vertices=verts,
        location=(cm(x), cm(y), cm(z))
    )
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'X':
        obj.rotation_euler = (0, math.radians(90), 0)
    elif axis == 'Y':
        obj.rotation_euler = (math.radians(90), 0, 0)
    if mat:
        obj.data.materials.append(mat)
    return link(obj, sub)


def add_torus(name, major_r, minor_r, x, y, z, mat, sub, axis='Z'):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=cm(major_r), minor_radius=cm(minor_r),
        location=(cm(x), cm(y), cm(z))
    )
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'X':
        obj.rotation_euler = (0, math.radians(90), 0)
    elif axis == 'Y':
        obj.rotation_euler = (math.radians(90), 0, 0)
    if mat:
        obj.data.materials.append(mat)
    return link(obj, sub)


def add_rgb_fan(name, radius, x, y, z, sub, axis='Z'):
    """Ventilador de 3 piezas: marco blanco + aspas translúcidas + anillo RGB.
    Cada capa se separa levemente a lo largo del eje del fan para que no
    queden coplanares (evita parpadeo / z-fighting)."""
    offsets = {'X': (1, 0, 0), 'Y': (0, 1, 0), 'Z': (0, 0, 1)}[axis]
    step = 0.35

    def shift(n):
        return (x + offsets[0] * step * n,
                y + offsets[1] * step * n,
                z + offsets[2] * step * n)

    fx, fy, fz = shift(0)
    bx, by, bz = shift(1)
    rx, ry, rz = shift(2)
    add_cylinder(f"{name}_Frame",  radius,       0.6, fx, fy, fz, MAT_WHITE,   sub, axis=axis)
    add_cylinder(f"{name}_Blades", radius - 0.4, 0.3, bx, by, bz, MAT_BLADE,   sub, axis=axis)
    add_torus(f"{name}_RGB",       radius - 0.5, 0.25, rx, ry, rz, MAT_RAINBOW, sub, axis=axis)


# ============================================================
# 5. GABINETE (Case) — blanco mate + vidrio templado
# ============================================================
def build_perforated_floor():
    """Base inferior tipo rejilla: tiras delgadas con separación entre ellas."""
    bar_w, gap = 1.0, 0.6
    pitch = bar_w + gap
    n = int(CASE_D // pitch)
    start_y = -((n - 1) * pitch) / 2
    for i in range(n):
        y = start_y + i * pitch
        add_box(f"Case_FloorGrille_{i:02d}", CASE_W - 1.0, bar_w, PANEL_T,
                0, y, PANEL_T / 2, MAT_WHITE, "Case")


build_perforated_floor()

# Paneles sólidos: trasero y lateral izquierdo (lado de la placa madre)
add_box("Case_Panel_Back", CASE_W, PANEL_T, CASE_H,
        0, -CASE_D / 2, CASE_H / 2, MAT_WHITE, "Case")
add_box("Case_Panel_Left", PANEL_T, CASE_D, CASE_H,
        -CASE_W / 2, 0, CASE_H / 2, MAT_WHITE, "Case")

# Vidrio templado: frente, lateral derecho (vista principal) y superior
add_box("Case_Glass_Front", CASE_W, PANEL_T, CASE_H,
        0, CASE_D / 2, CASE_H / 2, MAT_GLASS, "Case")
add_box("Case_Glass_Right", PANEL_T, CASE_D, CASE_H,
        CASE_W / 2, 0, CASE_H / 2, MAT_GLASS, "Case")
add_box("Case_Glass_Top", CASE_W, CASE_D, PANEL_T,
        0, 0, CASE_H - PANEL_T / 2, MAT_GLASS, "Case")


# ============================================================
# 6. TARJETA MADRE — ATX 30.5 x 24.4 cm, de pie contra la pared izquierda
# ============================================================
MB_THICK = 0.3
MB_H = 30.5   # alto del PCB         (eje Z)
MB_D = 24.4   # profundidad del PCB  (eje Y)

MB_X = -CASE_W / 2 + 1.5 + MB_THICK / 2     # separada de la pared (standoffs)
MB_Y_BACK = -CASE_D / 2 + 1.5                # borde trasero, junto al I/O
MB_Y = MB_Y_BACK + MB_D / 2
MB_Z_BOTTOM = 11.0                           # deja espacio abajo para la PSU
MB_Z = MB_Z_BOTTOM + MB_H / 2

add_box("Motherboard", MB_THICK, MB_D, MB_H, MB_X, MB_Y, MB_Z, MAT_PCB, "Motherboard")
MB_FACE_X = MB_X + MB_THICK / 2   # cara visible de la placa (hacia el vidrio)


# ============================================================
# 7. CPU — pequeño cuadrado centrado en el socket
# ============================================================
CPU_Y = MB_Y_BACK + MB_D * 0.35
CPU_Z = MB_Z_BOTTOM + MB_H * 0.68
add_box("CPU", 0.3, 4.0, 4.0, MB_FACE_X + 0.15, CPU_Y, CPU_Z, MAT_DARK_METAL, "Motherboard")


# ============================================================
# 8. COOLER DE CPU — bloque blanco grande + fan RGB mirando al frente
# ============================================================
COOLER_DX, COOLER_DY, COOLER_DZ = 16.0, 13.0, 14.0
cooler_x = MB_FACE_X + COOLER_DX / 2
add_box("CPU_Cooler_Block", COOLER_DX, COOLER_DY, COOLER_DZ,
        cooler_x, CPU_Y, CPU_Z, MAT_WHITE, "Cooling")

fan_radius = 5.8
fan_y = CPU_Y + COOLER_DY / 2 + 0.3   # cara frontal del cooler (hacia el frente)
add_rgb_fan("CPU_Cooler_Fan", fan_radius, cooler_x, fan_y, CPU_Z, "Cooling", axis='Y')


# ============================================================
# 9. RAM (x4) + SSD NVMe
# ============================================================
RAM_DX, RAM_DY, RAM_DZ = 3.2, 0.7, 13.3   # sobresale, grosor, alto
RAM_GAP = 1.0
ram_x = MB_FACE_X + RAM_DX / 2
ram_z_bottom = CPU_Z - 6.0
ram_z = ram_z_bottom + RAM_DZ / 2

# Arrancan después del borde +Y del cooler (y de su fan) para no encimarse:
# el cooler ocupa hasta CPU_Y + COOLER_DY/2 (~ +6.5) y el fan sobresale un
# poco más; dejamos un margen claro antes de empezar la fila de RAM.
ram_y_start = CPU_Y + COOLER_DY / 2 + 3.0
for i in range(4):
    ram_y = ram_y_start + i * RAM_GAP
    add_box(f"RAM_Stick_{i+1}", RAM_DX, RAM_DY, RAM_DZ,
            ram_x, ram_y, ram_z, MAT_WHITE, "Memory_Storage")
    add_box(f"RAM_RGB_Strip_{i+1}", RAM_DX, RAM_DY, 1.2,
            ram_x, ram_y, ram_z_bottom + RAM_DZ + 0.6, MAT_RAM_RGB, "Memory_Storage")

add_box("SSD_NVMe", 0.3, 8.0, 2.2,
        MB_FACE_X + 0.15, MB_Y_BACK + 8.0, MB_Z_BOTTOM + 5.0,
        MAT_DARK_METAL, "Memory_Storage")


# ============================================================
# 10. GPU — bloque horizontal blanco, conectado al slot PCIe
# ============================================================
GPU_LEN, GPU_THICK, GPU_DEPTH = 28.0, 5.0, 13.0   # largo, grosor, qué tanto sobresale
GPU_Z = MB_Z_BOTTOM + 9.0
gpu_y = MB_Y_BACK + GPU_LEN / 2
gpu_x = MB_FACE_X + GPU_DEPTH / 2

add_box("GPU_RTX_White", GPU_DEPTH, GPU_LEN, GPU_THICK, gpu_x, gpu_y, GPU_Z, MAT_WHITE, "GPU")
add_box("GPU_PCIe_Bracket", 0.3, 2.0, GPU_THICK + 1.0,
        MB_FACE_X + 0.15, MB_Y_BACK + 1.0, GPU_Z, MAT_DARK_METAL, "GPU")


# ============================================================
# 11. FUENTE DE PODER — oculta abajo, hacia atrás
# ============================================================
PSU_W, PSU_H, PSU_D = 15.0, 8.6, 16.0
psu_z = 1.0 + PSU_H / 2
psu_y = MB_Y_BACK + PSU_D / 2
add_box("PSU", PSU_W, PSU_D, PSU_H, 0, psu_y, psu_z, MAT_DARK_METAL, "PSU")


# ============================================================
# 12. VENTILADORES DEL GABINETE
# ============================================================
# Trasero, 120mm, extractor, panel de atrás
add_rgb_fan("Fan_Rear", 6.0, 4.0, -CASE_D / 2 + 0.5, 32.0, "Fans", axis='Y')

# Superiores (2), apuntando hacia arriba, bajo el vidrio del techo
add_rgb_fan("Fan_Top_1", 6.0, 0, -8, CASE_H - 1.0, "Fans", axis='Z')
add_rgb_fan("Fan_Top_2", 6.0, 0,  8, CASE_H - 1.0, "Fans", axis='Z')

# Inferiores (2), apuntando hacia arriba (intake desde la rejilla del piso)
add_rgb_fan("Fan_Bottom_1", 6.0, 0,  2, 1.0, "Fans", axis='Z')
add_rgb_fan("Fan_Bottom_2", 6.0, 0, 14, 1.0, "Fans", axis='Z')

print("PC_Build generado correctamente.")
