from convert_yaml_common import convert_items
import yaml

yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ID'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ObjectType'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'RendererType'], str)

convert_items(r'../disassembly/prototypes/ModelProtoSet.asset', r'../src/assets/prototypes/models.json')
