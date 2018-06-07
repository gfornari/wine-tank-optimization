import sys
import json
from random import randint

penalties = {
    "B": 110,
    "R": 90,
    "BB": 75,
    "BC": 60,
    "BA": 45,
    "RC": 30,
    "M": 15,
    "MTC": 5
}

color_to_class = {
    "B": 2,
    "R": 1,
    "BB": 2,
    "BC": 2,
    "BA": 2,
    "RC": 1,
    "M": 0,
    "MTC": 0
}

all_wines = [
    { "name": "Prosecco Superiore", "color": "B" },
    { "name": "Raboso", "color": "R" },
    { "name": "Cartizze", "color": "BB" },
    { "name": "Prosecco", "color": "BC" },
    { "name": "Gewurztraminer", "color": "BA" },
    { "name": "Mazzolada", "color": "RC" },
    { "name": "Mosto", "color": "M" },
    { "name": "Mosto concentrato rettificato", "color": "MTC" }
]

for w in all_wines:
    w["class"] = color_to_class[w["color"]]

def generate_tanks(n, min, max):
    return [ { "id": i, "cap": randint(min, max) } for i in range(n) ]

def generate_wines(n, min, max):
    wines = []
    for i in range(n):
        wine = all_wines[randint(0, len(all_wines)-1)]
        wine["amount"] = randint(min, max)
        wines.append(wine)
    return wines

if __name__ == "__main__":
    if len(sys.argv) < 8:
        print 'Usage: python %s <tanks_number> <min_cap> <max_cap> <wines_number> <min_amount> <max_amount> <output_dir>' % sys.argv[0]
        sys.exit(1)
    else:
        tanks_number = int(sys.argv[1])
        min_cap = int(sys.argv[2])
        max_cap = int(sys.argv[3])
        wines_number = int(sys.argv[4])
        min_amount = int(sys.argv[5])
        max_amount = int(sys.argv[6])
        output_dir = sys.argv[7]

    instance = {
        "penalty": penalties,
        "wines": generate_wines(wines_number, min_amount, max_amount),
        "tanks": generate_tanks(tanks_number, min_cap, max_cap)
    }

    output_file = (output_dir + '/data-' +
        str(tanks_number) + '-' +
        str(min_cap) + '-' +
        str(max_cap) + '-' +
        str(wines_number) + '-' +
        str(min_amount) + '-' +
        str(max_amount) + '.json')

    with open(output_file, 'w') as f:
        json.dump(instance, f, indent=2)