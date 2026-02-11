import json
import os

en_dir = "C:/code/AI/craft-agents-i18n/i18n/locales/en/components/app-shell"
zh_dir = "C:/code/AI/craft-agents-i18n/i18n/locales/zh-CN/components/app-shell"

# 获取所有文件
en_files = sorted(os.listdir(en_dir))
zh_files = sorted(os.listdir(zh_dir))

# 检查文件是否都存在
if set(en_files) != set(zh_files):
    print("⚠️ 文件列表不全匹配")
    print(f"EN 有但 ZH 没有: {set(en_files) - set(zh_files)}")
    print(f"ZH 有但 EN 没有: {set(zh_files) - set(en_files)}")
else:
    print(f"✅ 文件数量一致 ({len(en_files)} 个)")

# 检查 key 匹配
all_files = sorted(set(en_files) | set(zh_files))
all_match = True

for f in all_files:
    en_file = os.path.join(en_dir, f)
    zh_file = os.path.join(zh_dir, f)

    try:
        with open(en_file, 'r', encoding='utf-8') as en_f:
            en_data = json.load(en_f)
        with open(zh_file, 'r', encoding='utf-8') as zh_f:
            zh_data = json.load(zh_f)

        en_keys = set(en_data.keys())
        zh_keys = set(zh_data.keys())

        en_only_keys = en_keys - zh_keys
        zh_only_keys = zh_keys - en_keys

        if en_only_keys or zh_only_keys:
            print(f"\n⚠️ {f} - Key 不匹配:")
            if en_only_keys:
                print(f"  EN 独有: {len(en_only_keys)} 个")
                for k in sorted(en_only_keys):
                    print(f"    - {k}")
            if zh_only_keys:
                print(f"  ZH 独有: {len(zh_only_keys)} 个")
                for k in sorted(zh_only_keys):
                    print(f"    - {k}")
            all_match = False
    except Exception as e:
        print(f"\n❌ {f} - 处理错误: {e}")
        all_match = False

if all_match:
    print("\n✅ 所有语言文件的 key 完全匹配！")
else:
    print("\n❌ 部分语言文件存在 key 不匹配")

# 统计总数
total_en_keys = total_zh_keys = 0
for f in os.listdir(en_dir):
    with open(os.path.join(en_dir, f), 'r', encoding='utf-8') as file:
        total_en_keys += len(json.load(file).keys())
for f in os.listdir(zh_dir):
    with open(os.path.join(zh_dir, f), 'r', encoding='utf-8') as file:
        total_zh_keys += len(json.load(file).keys())

print(f"\n📊 总计:")
print(f"  EN 总 key 数: {total_en_keys}")
print(f"  ZH 总 key 数: {total_zh_keys}")
