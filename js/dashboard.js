const dashboardUser = requireTriplineSession();
function packageLevel(orderCount, liveCount) { if (orderCount >= 2 || liveCount >= 3) return 'EXTREME'; if (orderCount || liveCount) return 'ACTIVE'; return 'ROOKIE'; }
function renderEmptyList(target, message, href, label) { target.innerHTML = `<p class="empty-state">${message}</p><a class="btn-ghost" href="${href}">${label}</a>`; }
function renderDashboard() {
 if (!dashboardUser) return;
 const orders = getTriplineStore(TRIPLINE_ORDERS_KEY).filter((order) => order.email === dashboardUser.email);
 const lives = getTriplineStore(TRIPLINE_LIVES_KEY).filter((live) => live.creator === dashboardUser.name);
 document.getElementById('dashboardWelcome').textContent = `Hola, ${dashboardUser.name}. Aquí tienes tu estado operativo en TRIP LINE.`;
 document.getElementById('statOrders').textContent = orders.length; document.getElementById('statLives').textContent = lives.length; document.getElementById('statLevel').textContent = packageLevel(orders.length, lives.length);
 const ordersTarget = document.getElementById('dashboardOrders');
 if (!orders.length) renderEmptyList(ordersTarget, 'Aún no tienes reservas. Configura destino, fecha y viajeros para iniciar.', 'reserva.html', 'NUEVA RESERVA');
 else ordersTarget.innerHTML = orders.map((order, index) => `<div class="dashboard-row dashboard-row--booking"><div><strong>${order.destinationName || order.packageName}</strong><small>${order.departureDate || 'Fecha por confirmar'} · ${order.travelers || 1} viajero(s) · ${order.operator || 'TRIP LINE'}</small></div><span>${order.reference}</span><em>${order.status || 'CONFIRMADA'}</em><button class="row-action" type="button" data-cancel-order="${index}" ${order.status === 'CANCELACIÓN SOLICITADA' ? 'disabled' : ''}>${order.status === 'CANCELACIÓN SOLICITADA' ? 'SOLICITADA' : 'SOLICITAR CAMBIO'}</button></div>`).join('');
 const livesTarget = document.getElementById('dashboardLives');
 if (!lives.length) renderEmptyList(livesTarget, 'Todavía no has publicado lives demo.', 'comunidad.html', 'CREAR LIVE');
 else livesTarget.innerHTML = lives.map((live) => `<div class="dashboard-row"><strong>${live.title}</strong><span>${live.destination}</span><em>${live.viewers || 1} VIEWERS</em></div>`).join('');
 ordersTarget.querySelectorAll('[data-cancel-order]').forEach((button) => button.addEventListener('click', () => { orders[Number(button.dataset.cancelOrder)].status = 'CANCELACIÓN SOLICITADA'; const all = getTriplineStore(TRIPLINE_ORDERS_KEY); const target = all.find((item) => item.reference === orders[Number(button.dataset.cancelOrder)].reference); if (target) target.status = 'CANCELACIÓN SOLICITADA'; setTriplineStore(TRIPLINE_ORDERS_KEY, all); renderDashboard(); }));
}
document.getElementById('dashboardLogout')?.addEventListener('click', () => { clearTriplineSession(); location.href = 'login.html?next=dashboard.html'; });
if (dashboardUser) { refreshAuthNavigation(); renderDashboard(); }