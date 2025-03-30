document.addEventListener('DOMContentLoaded', function() {
    const createForm = document.getElementById('createForm');
    const studentList = document.getElementById('studentList');
    const refreshBtn = document.getElementById('refreshBtn');

    // Fetch all students
    async function fetchStudents() {
        try {
            studentList.innerHTML = '<p>Loading...</p>';
            const res = await fetch('/students');
            const { success, data, error } = await res.json();
            
            if (!success) throw new Error(error || 'Failed to load');
            renderStudents(data);
        } catch (err) {
            studentList.innerHTML = `<p class="error">${err.message}</p>`;
            console.error(err);
        }
    }

    // Render students
    function renderStudents(students) {
        studentList.innerHTML = students.length ? students.map(student => `
            <div class="student-card" data-id="${student.student_id}">
                <div class="student-info">
                    <h3>${student.first_name} ${student.last_name}</h3>
                    <p>DOB: ${student.dob}</p>
                    <p>Amount Due: $${student.amount_due.toFixed(2)}</p>
                </div>
                <div class="actions">
                    <button onclick="editStudent(${student.student_id})">✏️ Edit</button>
                    <button onclick="deleteStudent(${student.student_id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('') : '<p>No students found</p>';
    }

    // Create student
    createForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        
        try {
            btn.disabled = true;
            const formData = {
                first_name: document.getElementById('firstName').value.trim(),
                last_name: document.getElementById('lastName').value.trim(),
                dob: document.getElementById('dob').value,
                amount_due: document.getElementById('amountDue').value || '0'
            };

            const res = await fetch('/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const { success, data, error } = await res.json();
            if (!success) throw new Error(error || 'Creation failed');
            
            createForm.reset();
            await fetchStudents();
            alert(`Created: ${data.first_name} ${data.last_name}`);
        } catch (err) {
            alert(err.message);
        } finally {
            btn.disabled = false;
        }
    });

    // Initialize
    refreshBtn.addEventListener('click', fetchStudents);
    fetchStudents();
});

// Edit student (global function)
window.editStudent = async function(id) {
    try {
        // Get current data
        const res = await fetch(`/students/${id}`);
        const { data } = await res.json();
        
        // Create edit form
        const card = document.querySelector(`.student-card[data-id="${id}"]`);
        card.innerHTML = `
            <form onsubmit="handleUpdate(event, ${id})">
                <input type="text" value="${data.first_name}" required>
                <input type="text" value="${data.last_name}" required>
                <input type="date" value="${data.dob}" required>
                <input type="number" value="${data.amount_due}" step="0.01" required>
                <button type="submit">Save</button>
                <button type="button" onclick="location.reload()">Cancel</button>
            </form>
        `;
    } catch (err) {
        alert('Failed to edit: ' + err.message);
    }
};

// Update handler (global function)
window.handleUpdate = async function(e, id) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    try {
        btn.disabled = true;
        const data = {
            first_name: form[0].value.trim(),
            last_name: form[1].value.trim(),
            dob: form[2].value,
            amount_due: form[3].value
        };

        const res = await fetch(`/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const { success, error } = await res.json();
        if (!success) throw new Error(error || 'Update failed');
        
        alert('Updated successfully!');
        location.reload();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
    }
};

// Delete student (global function)
window.deleteStudent = async function(id) {
    if (!confirm('Delete this student?')) return;
    
    try {
        const res = await fetch(`/students/${id}`, { method: 'DELETE' });
        const { success, error } = await res.json();
        
        if (!success) throw new Error(error || 'Deletion failed');
        alert('Deleted successfully!');
        location.reload();
    } catch (err) {
        alert(err.message);
    }
};