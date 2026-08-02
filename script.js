document.addEventListener('DOMContentLoaded', () => {
    // Default start date to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;

    const form = document.getElementById('trackerForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePDF();
    });
});

function generatePDF() {
    const goal = document.getElementById('goal').value.trim();
    const rawDate = document.getElementById('startDate').value;
    const totalDays = parseInt(document.getElementById('length').value, 10);

    if (!goal) {
        alert('Please enter a habit goal.');
        return;
    }

    // Format start date
    const dateObj = new Date(rawDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
   
    // Initialize jsPDF in LANDSCAPE mode (Letter size: 792 x 612 pt)
    const { jsPDF } = window.jspdf;
    const pageSize = document.getElementById('pageSize').value; // 'letter' or 'a4'

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: pageSize
    });

    // Get the actual width dynamically from the document object instead of hardcoding 792
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Header Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HABITFORGE', 54, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Goal: ${goal}`, 54, 70);
    doc.text(`Start Date: ${formattedDate}`, 54, 90);
    doc.text(`Target: ${totalDays}-Day Commitment`, 560, 70);

    // Header separator line
    doc.setLineWidth(1);
    doc.setDrawColor(200, 200, 200);
    doc.line(54, 105, width - 54, 105);

    // Grid Layout Engine (Landscape: 15 items per row, dynamically spaced)
    const rows = totalDays / 15;
    const boxSize = 30;
    const startX = 54;
    const endX = width - 54;
    const availableWidth = endX - startX;
    
    // Spread the 15 boxes smoothly across the available landscape width
    const spacingX = (availableWidth - (15 * boxSize)) / 14;
    const spacingY = 18;
    const startY = 135;

    let dayCounter = 1;
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < 15; col++) {
            if (dayCounter > totalDays) break;

            const x = startX + col * (boxSize + spacingX);
            const y = startY + r * (boxSize + spacingY);

            // Shaded fill for major milestones (30, 60, 90)
            if (dayCounter === 30 || dayCounter === 60 || dayCounter === 90) {
                doc.setFillColor(203, 213, 225); // Slate tint (#CBD5E1)
                doc.rect(x, y, boxSize, boxSize, 'FD'); // Fill and stroke
            } else {
                doc.setFillColor(255, 255, 255);
                doc.rect(x, y, boxSize, boxSize, 'S'); // Stroke only
            }

            // Box Number Label
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(dayCounter.toString(), x + boxSize / 2, y + boxSize / 2 + 3, { align: 'center' });

            dayCounter++;
        }
    }

    // Footer Instructions (adjusted for landscape height of 612 pt)
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Instructions: Fill in a box every day you spend at least 30 minutes on your habit.', 54, 560);
    doc.text('Shaded boxes mark major milestones (Day 30, 60, and 90). Keep going!', 54, 574);

    // Trigger PDF browser download
    doc.save(`habitforge_${totalDays}days.pdf`);
}
