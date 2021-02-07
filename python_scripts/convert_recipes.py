from convert_yaml_common import convert_items
import yaml

yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'ID'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'SID'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'Type'], str)
yaml.BaseLoader.add_path_resolver(u'!!bool', ['MonoBehaviour', 'dataArray', None, 'Handcraft'], str)
yaml.BaseLoader.add_path_resolver(u'!!bool', ['MonoBehaviour', 'dataArray', None, 'Explicit'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'TimeSpend'], str)
yaml.BaseLoader.add_path_resolver(u'!intlist', ['MonoBehaviour', 'dataArray', None, 'Items'], str)
yaml.BaseLoader.add_path_resolver(u'!intlist', ['MonoBehaviour', 'dataArray', None, 'ItemCounts'], str)
yaml.BaseLoader.add_path_resolver(u'!intlist', ['MonoBehaviour', 'dataArray', None, 'Results'], str)
yaml.BaseLoader.add_path_resolver(u'!intlist', ['MonoBehaviour', 'dataArray', None, 'ResultCounts'], str)
yaml.BaseLoader.add_path_resolver(u'!!int', ['MonoBehaviour', 'dataArray', None, 'GridIndex'], str)

convert_items(r'../disassembly/prototypes/RecipeProtoSet.asset', r'../src/assets/prototypes/recipes.json')
