
// ======================================
// MEDICARE HOSPITAL MANAGEMENT SYSTEM
// ======================================

// Load saved data
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let doctors = JSON.parse(localStorage.getItem("doctors")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];

let editPatientId = null;
let editDoctorId = null;

// Save all data
function saveData() {
    localStorage.setItem("patients", JSON.stringify(patients));
    localStorage.setItem("doctors", JSON.stringify(doctors));
    localStorage.setItem("appointments", JSON.stringify(appointments));
    localStorage.setItem("bills", JSON.stringify(bills));
}

// Generate unique IDs
function generateId(prefix) {
    return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

// ======================================
// PAGE NAVIGATION
// ======================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");

    const titles = {
        dashboard: "Hospital Dashboard",
        patients: "Patient Management",
        doctors: "Doctor Management",
        appointments: "Appointment Management",
        billing: "Billing Management"
    };

    document.getElementById("pageTitle").textContent = titles[pageId];
    updateDashboard();
}

// ======================================
// PATIENT MANAGEMENT
// ======================================

document.getElementById("patientForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const patient = {
        id: editPatientId || generateId("P"),
        name: document.getElementById("patientName").value.trim(),
        age: document.getElementById("patientAge").value,
        gender: document.getElementById("patientGender").value,
        phone: document.getElementById("patientPhone").value.trim()
    };

    if (editPatientId) {
        patients = patients.map(p => p.id === editPatientId ? patient : p);
        editPatientId = null;
    } else {
        patients.push(patient);
    }

    saveData();
    this.reset();
    renderPatients();
    updateDashboard();
});

function renderPatients() {
    const table = document.getElementById("patientTable");
    table.innerHTML = "";

    patients.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${escapeHTML(p.name)}</td>
                <td>${escapeHTML(p.age)}</td>
                <td>${escapeHTML(p.gender)}</td>
                <td>${escapeHTML(p.phone)}</td>
                <td>
                    <button onclick="editPatient('${p.id}')">Edit</button>
                    <button onclick="deletePatient('${p.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    updatePatientDropdowns();
}

function editPatient(id) {
    const p = patients.find(p => p.id === id);
    if (!p) return;

    document.getElementById("patientName").value = p.name;
    document.getElementById("patientAge").value = p.age;
    document.getElementById("patientGender").value = p.gender;
    document.getElementById("patientPhone").value = p.phone;

    editPatientId = id;
    showPage("patients");
}

function deletePatient(id) {
    if (!confirm("Delete this patient? Related appointments and bills will also be removed.")) return;

    patients = patients.filter(p => p.id !== id);
    appointments = appointments.filter(a => a.patientId !== id);
    bills = bills.filter(b => b.patientId !== id);

    saveData();
    renderPatients();
    renderAppointments();
    renderBills();
    updateDashboard();
}

// ======================================
// DOCTOR MANAGEMENT
// ======================================

document.getElementById("doctorForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const doctor = {
        id: editDoctorId || generateId("D"),
        name: document.getElementById("doctorName").value.trim(),
        specialization: document.getElementById("specialization").value.trim(),
        phone: document.getElementById("doctorPhone").value.trim()
    };

    if (editDoctorId) {
        doctors = doctors.map(d => d.id === editDoctorId ? doctor : d);
        editDoctorId = null;
    } else {
        doctors.push(doctor);
    }

    saveData();
    this.reset();
    renderDoctors();
    updateDashboard();
});

function renderDoctors() {
    const table = document.getElementById("doctorTable");
    table.innerHTML = "";

    doctors.forEach(d => {
        table.innerHTML += `
            <tr>
                <td>${d.id}</td>
                <td>${escapeHTML(d.name)}</td>
                <td>${escapeHTML(d.specialization)}</td>
                <td>${escapeHTML(d.phone)}</td>
                <td>
                    <button onclick="editDoctor('${d.id}')">Edit</button>
                    <button onclick="deleteDoctor('${d.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    updateDoctorDropdown();
}

function editDoctor(id) {
    const d = doctors.find(d => d.id === id);
    if (!d) return;

    document.getElementById("doctorName").value = d.name;
    document.getElementById("specialization").value = d.specialization;
    document.getElementById("doctorPhone").value = d.phone;

    editDoctorId = id;
    showPage("doctors");
}

function deleteDoctor(id) {
    if (!confirm("Delete this doctor? Related appointments will also be removed.")) return;

    doctors = doctors.filter(d => d.id !== id);
    appointments = appointments.filter(a => a.doctorId !== id);

    saveData();
    renderDoctors();
    renderAppointments();
    updateDashboard();
}

// ======================================
// DROPDOWN MANAGEMENT
// ======================================

function updatePatientDropdowns() {
    const patientDropdowns = [
        document.getElementById("appointmentPatient"),
        document.getElementById("billingPatient")
    ];

    patientDropdowns.forEach(dropdown => {
        const oldValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Select Patient</option>';

        patients.forEach(p => {
            dropdown.innerHTML += `
                <option value="${p.id}">${escapeHTML(p.name)}</option>
            `;
        });

        if (patients.some(p => p.id === oldValue)) {
            dropdown.value = oldValue;
        }
    });
}

function updateDoctorDropdown() {
    const dropdown = document.getElementById("appointmentDoctor");
    const oldValue = dropdown.value;

    dropdown.innerHTML = '<option value="">Select Doctor</option>';

    doctors.forEach(d => {
        dropdown.innerHTML += `
            <option value="${d.id}">${escapeHTML(d.name)} - ${escapeHTML(d.specialization)}</option>
        `;
    });

    if (doctors.some(d => d.id === oldValue)) {
        dropdown.value = oldValue;
    }
}

// ======================================
// APPOINTMENT MANAGEMENT
// ======================================

document.getElementById("appointmentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const patientId = document.getElementById("appointmentPatient").value;
    const doctorId = document.getElementById("appointmentDoctor").value;

    if (!patients.some(p => p.id === patientId) ||
        !doctors.some(d => d.id === doctorId)) {
        alert("Please select a valid patient and doctor.");
        return;
    }

    const appointment = {
        id: generateId("A"),
        patientId,
        doctorId,
        date: document.getElementById("appointmentDate").value,
        status: document.getElementById("appointmentStatus").value
    };

    appointments.push(appointment);

    saveData();
    this.reset();
    renderAppointments();
    updateDashboard();

    alert("Appointment booked successfully!");
});

function renderAppointments() {
    const table = document.getElementById("appointmentTable");
    table.innerHTML = "";

    appointments.forEach(a => {
        const patient = patients.find(p => p.id === a.patientId);
        const doctor = doctors.find(d => d.id === a.doctorId);

        table.innerHTML += `
            <tr>
                <td>${a.id}</td>
                <td>${escapeHTML(patient?.name || "Unknown")}</td>
                <td>${escapeHTML(doctor?.name || "Unknown")}</td>
                <td>${escapeHTML(a.date)}</td>
                <td>${escapeHTML(a.status)}</td>
                <td>
                    <button onclick="deleteAppointment('${a.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    renderDashboardAppointments();
}

function deleteAppointment(id) {
    if (!confirm("Delete this appointment?")) return;

    appointments = appointments.filter(a => a.id !== id);

    saveData();
    renderAppointments();
    updateDashboard();
}

// ======================================
// BILLING MANAGEMENT
// ======================================

document.getElementById("billingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const patientId = document.getElementById("billingPatient").value;
    const amount = Number(document.getElementById("billAmount").value);

    if (!patients.some(p => p.id === patientId) || !Number.isFinite(amount) || amount <= 0) {
        alert("Please select a valid patient and enter a valid amount.");
        return;
    }

    const bill = {
        id: generateId("B"),
        patientId,
        amount,
        status: document.getElementById("paymentStatus").value
    };

    bills.push(bill);

    saveData();
    this.reset();
    renderBills();
    updateDashboard();

    alert("Bill generated successfully!");
});

function renderBills() {
    const table = document.getElementById("billingTable");
    table.innerHTML = "";

    bills.forEach(b => {
        const patient = patients.find(p => p.id === b.patientId);

        table.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td>${escapeHTML(patient?.name || "Unknown")}</td>
                <td>₹${Number(b.amount).toLocaleString("en-IN")}</td>
                <td>${escapeHTML(b.status)}</td>
                <td>
                    <button onclick="deleteBill('${b.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteBill(id) {
    if (!confirm("Delete this bill?")) return;

    bills = bills.filter(b => b.id !== id);

    saveData();
    renderBills();
    updateDashboard();
}

// ======================================
// DASHBOARD
// ======================================

function updateDashboard() {
    document.getElementById("totalPatients").textContent = patients.length;
    document.getElementById("totalDoctors").textContent = doctors.length;
    document.getElementById("totalAppointments").textContent = appointments.length;

    const revenue = bills
        .filter(b => b.status === "Paid")
        .reduce((sum, b) => sum + Number(b.amount), 0);

    document.getElementById("totalRevenue").textContent =
        "₹" + revenue.toLocaleString("en-IN");

    renderDashboardAppointments();
}

function renderDashboardAppointments() {
    const table = document.getElementById("dashboardAppointments");
    if (!table) return;

    table.innerHTML = "";

    appointments.slice(-5).reverse().forEach(a => {
        const patient = patients.find(p => p.id === a.patientId);
        const doctor = doctors.find(d => d.id === a.doctorId);

        table.innerHTML += `
            <tr>
                <td>${escapeHTML(patient?.name || "Unknown")}</td>
                <td>${escapeHTML(doctor?.name || "Unknown")}</td>
                <td>${escapeHTML(a.date)}</td>
                <td>${escapeHTML(a.status)}</td>
            </tr>
        `;
    });
}

// ======================================
// BASIC HTML SAFETY
// ======================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ======================================
// INITIALIZE APPLICATION
// ======================================

function initializeApp() {
    renderPatients();
    renderDoctors();
    renderAppointments();
    renderBills();
    updateDashboard();
}

initializeApp();
