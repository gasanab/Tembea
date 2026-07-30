import re

file_path = 'src/app/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

def replace_fallback(variable_name, item_name, empty_message):
    pattern = re.compile(
        r"(\) : " + variable_name + r"\.length > 0 \? \(\s+" + variable_name + r"\.map\(\(" + item_name + r"\) => \(\s+<ListingCard key=\{" + item_name + r"\.id\} listing=\{" + item_name + r"\} />\s+\)\s+\)\s+\) : \(\s+<>\s+<div className=\"tembea-card group\">)(.*?)(</>\s+\))",
        re.DOTALL
    )
    
    def replacer(match):
        prefix = match.group(1)
        suffix = match.group(3)
        # We replace the entire `) : ( <> ... </> )` with our simple fallback
        
        replacement = f""") : {variable_name}.length > 0 ? (
              {variable_name}.map(({item_name}) => (
                <ListingCard key={{{item_name}.id}} listing={{{item_name}}} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-semibold">{empty_message}</p>
              </div>
            )"""
        return replacement

    return pattern.sub(replacer, text)

# We have these sections:
# featuredListings / listing
# hotels / listing
# restaurants / listing
# events / listing
# experiences / listing
# marketplace / listing
# transport / listing

sections = [
    ("featuredListings", "listing", "No featured listings available right now."),
    ("hotels", "listing", "No featured hotels available right now."),
    ("restaurants", "listing", "No popular restaurants available right now."),
    ("events", "listing", "No upcoming events available right now."),
    ("experiences", "listing", "No experiences available right now."),
    ("marketplace", "listing", "No marketplace items available right now."),
    ("transport", "listing", "No transport options available right now.")
]

for var_name, item_name, msg in sections:
    # Build regex to match the fallback
    pattern = re.compile(
        r"\) : " + var_name + r"\.length > 0 \? \([\s\S]*?\) : \([\s\S]*?<\/>\s+\)",
        re.MULTILINE
    )
    
    def replacer(match):
        return f""") : {var_name}.length > 0 ? (
              {var_name}.map(({item_name}) => (
                <ListingCard key={{{item_name}.id}} listing={{{item_name}}} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-semibold">{msg}</p>
              </div>
            )"""
    
    text = pattern.sub(replacer, text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Mock data removed from page.tsx!")
