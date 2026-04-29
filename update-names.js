const fs = require('fs');
let content = fs.readFileSync('lib/expedition-data.js', 'utf8');

const replacements = {
  '\"C2L Nepal Logistics and Packing List\"': '\"Logistics & Packing\"',
  '\"Nepal Government Guide\"': '\"Govt Guide\"',
  '\"Route Briefing-Stretch 1\"': '\"Route Briefing\"',
  '\"Chitwan Prospectus\"': '\"Prospectus\"',
  '\"Route Briefing-Stretch 2\"': '\"Route Briefing\"',
  '\"Pokhara MidHill Planetary Health Prospectus\"': '\"Prospectus\"',
  '\"Route Briefing-Stretch 3\"': '\"Route Briefing\"',
  '\"Lower mustang final\"': '\"Prospectus\"',
  '\"Lower Mustang final\"': '\"Prospectus\"',
  '\"Route Briefing-Stretch 4\"': '\"Route Briefing\"',
  '\"Upper Mustang Prospectus\"': '\"Prospectus\"',
  '\"Uppermustang_Prospectus\"': '\"Prospectus\"'
};

for (const [oldName, newName] of Object.entries(replacements)) {
  content = content.replace(new RegExp(oldName, 'g'), newName);
}

fs.writeFileSync('lib/expedition-data.js', content, 'utf8');
