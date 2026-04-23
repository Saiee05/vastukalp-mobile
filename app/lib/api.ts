const BASE_URL = "https://vastukalp.onrender.com";

// LOGIN
export async function loginApi(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
}

// PROJECTS
export async function getProjectsApi() {
  const response = await fetch(`${BASE_URL}/api/projects`);
  return await response.json();
}

export async function addProjectApi(project: any) {
  const response = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  return await response.json();
}

export async function updateProjectApi(id: number, project: any) {
  const response = await fetch(`${BASE_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  return await response.json();
}

export async function deleteProjectApi(id: number) {
  const response = await fetch(`${BASE_URL}/api/projects/${id}`, {
    method: "DELETE",
  });

  return await response.json();
}

// CLIENTS
export async function getClientsApi() {
  const response = await fetch(`${BASE_URL}/api/clients`);
  return await response.json();
}

export async function addClientApi(client: any) {
  const response = await fetch(`${BASE_URL}/api/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  return await response.json();
}

export async function updateClientApi(id: number, client: any) {
  const response = await fetch(`${BASE_URL}/api/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  return await response.json();
}

export async function deleteClientApi(id: number) {
  const response = await fetch(`${BASE_URL}/api/clients/${id}`, {
    method: "DELETE",
  });

  return await response.json();
}

// EMPLOYEES
export async function getEmployeesApi() {
  const response = await fetch(`${BASE_URL}/api/employees`);
  return await response.json();
}

export async function addEmployeeApi(employee: any) {
  const response = await fetch(`${BASE_URL}/api/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  return await response.json();
}

export async function updateEmployeeApi(id: number, employee: any) {
  const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  return await response.json();
}

export async function deleteEmployeeApi(id: number) {
  const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
    method: "DELETE",
  });

  return await response.json();
}

// NOTIFICATIONS
export async function getNotificationsApi(userId: number) {
  const response = await fetch(`${BASE_URL}/api/notifications/${userId}`);
  return await response.json();
}

// FINANCE
export async function getProjectFinanceApi(projectId: number) {
  const response = await fetch(`${BASE_URL}/api/project-finance/${projectId}`);
  return await response.json();
}

export async function updateProjectFinanceApi(projectId: number, payload: any) {
  const response = await fetch(`${BASE_URL}/api/project-finance/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

export async function addProjectPaymentApi(projectId: number, payload: any) {
  const response = await fetch(`${BASE_URL}/api/project-finance/${projectId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}