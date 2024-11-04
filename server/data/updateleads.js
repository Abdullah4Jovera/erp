const fs = require('fs');

// Load the JSON data
const leadsData = JSON.parse(fs.readFileSync('./leads.json', 'utf8'));
const labelsData = JSON.parse(fs.readFileSync('./labels.json', 'utf8'));

// Create a mapping of label IDs to names
const labelsMap = {};
labelsData.forEach(label => {
    labelsMap[label.id] = label.name; // Map label ID to name (if needed for future use)
});

// Update the leads with label IDs as an array
const updatedLeads = leadsData.map(lead => {
    // Check if labels is not null or undefined
    if (lead.labels) {
        // Split the labels string into an array of IDs and keep them as an array
        const labelIds = lead.labels.split(',').map(id => id.trim()); // Trim spaces if any
        
        // Return the updated lead object with labels as an array of IDs
        return {
            ...lead,
            labels: labelIds // Store as an array of IDs
        };
    } else {
        // Return the lead object unchanged if labels is null
        return lead;
    }
});

// Save the updated leads back to leads.json
fs.writeFileSync('updated_leads.json', JSON.stringify(updatedLeads, null, 2), 'utf8');

console.log('Leads updated successfully!');
