import csv

ea_ids = {
    'Jonathan David': '243630',
    'Oyarzabal': '230142',
    'Jean-Philippe Mateta': '240134',
    'Yoane Wissa': '233064',
    'Dušan Vlahović': '246147',
    'Arkadiusz Milik': '214875',
    'Sébastien Haller': '205693',
    'Andrea Belotti': '211320',
    'Evanilson': '241093',
    'Salem Al Dawsari': '211256',
    'Álex Berenguer': '225881',
    'Yannick Carrasco': '208418',
    'Gabriel Martinelli': '251566',
    'Harvey Barnes': '235790',
    'Armand Laurienté': '246618',
    'Christian Pulisic': '227796',
    'Takefusa Kubo': '237823',
    'Ángel Di María': '183898',
    'Domenico Berardi': '202750',
    'Mason Greenwood': '246141',
    'Dodi Lukébakio': '231580',
    'Ritsu Doan': '237699',
    'Facundo Buonanotte': '269869',
    'Amad Diallo': '256123',
    'Oscar Gloukh': '268297',
    'Tete': '242000',
    'Éderson': '241266',
    'Orkun Kökçü': '243952',
    'Denis Zakaria': '225100',
    'Morgan Rogers': '265697',
    'Malik Tillman': '257322',
    'Otávio': '220803',
    'Rafa': '210513',
    'Giovani Lo Celso': '232432',
    'Mario Götze': '192318',
    'Parejo': '189513',
    'Mattéo Guendouzi': '238072',
    'Benoit Badiashile': '244229',
    'Davide Frattesi': '240360',
    'Sander Berge': '228085',
    'Youri Tielemans': '231636',
    'Wilfried Ndidi': '234045',
    'Tyreek Wilson': '263688',
    'Romain Faivre': '240367',
    'Sérgio Conceição': '257530',
    'Pervis Estupiñán': '234236',
    'David Raum': '237012',
    'Milos Kerkez': '263688',
    'Marc Cucurella': '244203',
    'Alejandro Balde': '260533',
    'Ferland Mendy': '238789',
    'Destiny Udogie': '257855',
    'Ola Aina': '231548',
    'Kyle Walker': '188350',
    'Reece James': '238074',
    'Benjamin White': '235569',
    'Kalvin Phillips': '230666',
    'Jeremie Freuler': '212616',
    'Denzel Dumfries': '228093',
    'Giovanni Di Lorenzo': '228702',
    'Pedro Porro': '247204',
    'Konrad Laimer': '232580',
    'Marcos Llorente': '226161',
    'Aaron Wan-Bissaka': '229880',
    'Max Aarons': '243566',
    'Fabio Vigorito': '214061',
    'Kim Min-jae': '246260',
    'Matthijs de Ligt': '235243',
    'Micky van de Ven': '256157',
    'Cristian Romero': '232432',
    'Emre Can': '208333',
    'David Alaba': '197445',
    'John Stones': '203574',
    'Manuel Akanji': '229237',
    'Waldemar Anton': '231691',
    'Kalidou Koulibaly': '201024',
    'Dayot Upamecano': '229558',
    'Danilo': '199304',
    'Malick Tillman': '257322',
    'Sergio Gomez': '245367',
    'Lisandro Martínez': '243051',
    'Stefan Ortega': '203841',
    'Diogo Costa': '241671',
    'André Onana': '226753',
    'Aaron Ramsdale': '235569',
    'Mile Svilar': '224168',
    'Gerónimo Rulli': '214583',
    'Guglielmo Vicario': '228698',
    'Rui Silva': '212822',
    'De Gea': '193080',
    'Diego Conde': '225881',
    'Sergio Herrera': '214979',
    'Matej Kovar': '240726'
}

with open('src/data/players.csv', 'r', encoding='utf8') as f:
    reader = csv.reader(f)
    rows = list(reader)

for row in rows[1:]:
    if len(row) < 7:
        if row[1] in ea_ids:
            row.append(ea_ids[row[1]])
        else:
            row.append('')
    elif row[6].strip() == '':
        if row[1] in ea_ids:
            row[6] = ea_ids[row[1]]

with open('src/data/players.csv', 'w', newline='', encoding='utf8') as f:
    writer = csv.writer(f)
    writer.writerows(rows)
