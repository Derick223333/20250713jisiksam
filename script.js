// Todo 앱 클래스 - Bootstrap & SweetAlert2 버전
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setCurrentDate();
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
    }

    // 현재 날짜 설정
    setCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('ko-KR', options);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 할일 추가
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 완료된 항목 삭제
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        
        // 모든 항목 삭제
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    // 할일 추가
    async addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showSweetAlert('warning', '입력 오류', '할일을 입력해주세요!');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            await this.updateTodo(this.currentEditId, text);
            this.currentEditId = null;
            input.value = '';
            document.getElementById('addBtn').innerHTML = '<i class="fas fa-plus me-2"></i>추가';
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        input.value = '';
        
        this.showSweetAlert('success', '성공!', '할일이 추가되었습니다!', '🎉');
    }

    // 할일 완료/미완료 토글
    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            
            const message = todo.completed ? '할일을 완료했습니다!' : '할일을 다시 시작합니다!';
            const icon = todo.completed ? '✅' : '🔄';
            this.showSweetAlert('info', '상태 변경', message, icon);
        }
    }

    // 할일 편집
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.currentEditId = id;
            document.getElementById('todoInput').value = todo.text;
            document.getElementById('todoInput').focus();
            document.getElementById('addBtn').innerHTML = '<i class="fas fa-save me-2"></i>수정';
            
            this.showSweetAlert('info', '편집 모드', '할일을 수정하고 "수정" 버튼을 클릭하세요.', '✏️');
        }
    }

    // 할일 업데이트
    async updateTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.renderTodos();
            this.showSweetAlert('success', '수정 완료', '할일이 수정되었습니다!', '💾');
        }
    }

    // 할일 삭제
    async deleteTodo(id) {
        const result = await Swal.fire({
            title: '할일 삭제',
            text: '정말로 이 할일을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            }
        });

        if (result.isConfirmed) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showSweetAlert('success', '삭제 완료', '할일이 삭제되었습니다!', '🗑️');
        }
    }

    // 완료된 항목들 삭제
    async clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showSweetAlert('warning', '삭제할 항목 없음', '삭제할 완료된 항목이 없습니다!', '⚠️');
            return;
        }

        const result = await Swal.fire({
            title: '완료된 항목 삭제',
            text: `완료된 ${completedCount}개의 항목을 삭제하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            }
        });

        if (result.isConfirmed) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showSweetAlert('success', '삭제 완료', `${completedCount}개의 완료된 항목이 삭제되었습니다!`, '🗑️');
        }
    }

    // 모든 항목 삭제
    async clearAll() {
        if (this.todos.length === 0) {
            this.showSweetAlert('warning', '삭제할 항목 없음', '삭제할 항목이 없습니다!', '⚠️');
            return;
        }

        const result = await Swal.fire({
            title: '모든 항목 삭제',
            text: '모든 할일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '모두 삭제',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            }
        });

        if (result.isConfirmed) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showSweetAlert('success', '삭제 완료', '모든 할일이 삭제되었습니다!', '🗑️');
        }
    }

    // 할일 렌더링
    renderTodos() {
        const todoList = document.getElementById('todoList');
        const completedList = document.getElementById('completedList');
        
        const pendingTodos = this.todos.filter(t => !t.completed);
        const completedTodos = this.todos.filter(t => t.completed);

        // 진행중인 할일 렌더링
        if (pendingTodos.length === 0) {
            todoList.innerHTML = `
                <li class="list-group-item empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p class="mb-0">진행중인 할일이 없습니다.<br>새로운 할일을 추가해보세요!</p>
                </li>
            `;
        } else {
            todoList.innerHTML = pendingTodos.map(todo => this.createTodoItem(todo)).join('');
        }

        // 완료된 할일 렌더링
        if (completedTodos.length === 0) {
            completedList.innerHTML = `
                <li class="list-group-item empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p class="mb-0">완료된 할일이 없습니다.</p>
                </li>
            `;
        } else {
            completedList.innerHTML = completedTodos.map(todo => this.createTodoItem(todo)).join('');
        }

        // 이벤트 리스너 다시 바인딩
        this.bindTodoEvents();
    }

    // 할일 아이템 HTML 생성
    createTodoItem(todo) {
        return `
            <li class="list-group-item todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="todo-content">
                        <input type="checkbox" class="form-check-input todo-checkbox me-3" ${todo.completed ? 'checked' : ''}>
                        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    </div>
                    <div class="todo-actions">
                        <button class="btn btn-sm edit-btn" title="편집">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm delete-btn" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </li>
        `;
    }

    // 할일 아이템 이벤트 바인딩
    bindTodoEvents() {
        // 체크박스 이벤트
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const id = parseInt(todoItem.dataset.id);
                this.toggleTodo(id);
            });
        });

        // 편집 버튼 이벤트
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const id = parseInt(todoItem.dataset.id);
                this.editTodo(id);
            });
        });

        // 삭제 버튼 이벤트
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const id = parseInt(todoItem.dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;

        // 통계 카드에 애니메이션 효과 추가
        this.animateStats();
    }

    // 통계 애니메이션
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.classList.add('success-checkmark');
            setTimeout(() => {
                stat.classList.remove('success-checkmark');
            }, 600);
        });
    }

    // 로컬 스토리지에 저장
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // SweetAlert2 알림 표시
    showSweetAlert(icon, title, text, emoji = '') {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content'
            },
            didOpen: (toast) => {
                if (emoji) {
                    toast.querySelector('.swal2-title').innerHTML = `${emoji} ${title}`;
                }
            }
        });
    }

    // 성공 토스트 알림
    showSuccessToast(message, emoji = '🎉') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'swal2-popup'
            }
        });

        Toast.fire({
            icon: 'success',
            title: `${emoji} ${message}`
        });
    }

    // 로딩 표시
    showLoading() {
        Swal.fire({
            title: '처리 중...',
            html: '<div class="loading"></div>',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
                popup: 'swal2-popup'
            }
        });
    }

    // 로딩 숨기기
    hideLoading() {
        Swal.close();
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
    
    // 페이지 로드 시 환영 메시지
    setTimeout(() => {
        const welcomeAlert = Swal.fire({
            title: 'Todo 앱에 오신 것을 환영합니다! 🎉',
            text: '할일을 추가하고 체계적으로 관리해보세요.',
            icon: 'info',
            confirmButtonText: '시작하기',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content',
                confirmButton: 'swal2-confirm'
            }
        });
    }, 1000);
});
