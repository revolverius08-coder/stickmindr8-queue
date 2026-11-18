import sys,time;sys.path.insert(0,'/tmp/b3d/pkg')
import bpy,math
t0=time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=int(sys.argv[1]);sc.cycles.use_denoising=True
sc.render.resolution_x=540;sc.render.resolution_y=960;sc.render.resolution_percentage=100
# phone body
bpy.ops.mesh.primitive_cube_add(size=1);b=bpy.context.object;b.scale=(0.75,0.08,1.55);b.name='body'
bev=b.modifiers.new('b','BEVEL');bev.width=0.09;bev.segments=6;sub=b.modifiers.new('s','SUBSURF');sub.levels=1
m=bpy.data.materials.new('m');m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(0.95,0.45,0.35,1);p.inputs['Metallic'].default_value=0.8;p.inputs['Roughness'].default_value=0.25;b.data.materials.append(m)
bpy.ops.mesh.primitive_plane_add(size=1);s=bpy.context.object;s.scale=(0.68,1.4,1);s.rotation_euler=(math.pi/2,0,0);s.location=(0,-0.0805,0)
img=bpy.data.images.load('/home/claude/work/aitrends-2d-studio/projects/clip16/input/avatar.png')
sm=bpy.data.materials.new('s');sm.use_nodes=True;n=sm.node_tree.nodes;bs=n['Principled BSDF'];ti=n.new('ShaderNodeTexImage');ti.image=img;sm.node_tree.links.new(ti.outputs[0],bs.inputs['Emission Color']);bs.inputs['Emission Strength'].default_value=1.0;bs.inputs['Base Color'].default_value=(0,0,0,1);bs.inputs['Roughness'].default_value=0.05;s.data.materials.append(sm)
bpy.ops.mesh.primitive_plane_add(size=30);f=bpy.context.object;f.location=(0,0,-1.7);fm=bpy.data.materials.new('f');fm.use_nodes=True;fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(0.25,0.03,0.04,1);f.data.materials.append(fm)
bpy.ops.object.light_add(type='AREA',location=(2,-3,2));l=bpy.context.object;l.data.energy=600;l.data.size=3;l.rotation_euler=(1.2,0,0.6)
bpy.ops.object.camera_add(location=(1.6,-5.2,0.4),rotation=(math.radians(88),0,math.radians(18)));sc.camera=bpy.context.object;sc.camera.data.lens=50
b.rotation_euler=(0,0,math.radians(-18))
sc.render.filepath='/tmp/b3d/test.png';t1=time.time();bpy.ops.render.render(write_still=True);print('setup',round(t1-t0,1),'render',round(time.time()-t1,1))
