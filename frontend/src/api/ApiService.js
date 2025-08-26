import axios from "axios";

export default class ApiService {

    static API_URL = "http://localhost:8080/api"


    static saveToken(token) {
        localStorage.setItem("token", token)
    }

    static getToken() {
        return localStorage.getItem("token")
    }

    static isAuthenticated() {
        return !!localStorage.getItem("token");
    }
    
    static logout() {
        localStorage.removeItem("token");
        // Clear user data from any caches
        window.location.href = "/login";
    }
    
    static clearInvalidToken() {
        localStorage.removeItem("token");
        console.log("Invalid token cleared");
    }

    static async getCurrentUser() {
        try {
            const resp = await axios.get(`${this.API_URL}/users/current`, {
                headers: this.getHeader()
            });
            return resp.data;
        } catch (error) {
            console.error('Error fetching current user:', error);
            
            // If unauthorized or user not found, clear the invalid token
            if (error.response?.status === 401 || error.response?.status === 404) {
                this.clearInvalidToken();
                window.location.href = "/login";
            }
            
            return null;
        }
    }

    static getUserInfo() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            // Decode JWT token to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    static async getUserRole() {
        const currentUser = await this.getCurrentUser();
        console.log('Current User from API:', currentUser); // Debug log
        return currentUser; // Return the full user object, not just the role
    }

    static async isAdmin() {
        const user = await this.getUserRole();
        return user?.role === 'ADMIN';
    }

    static async isUser() {
        const user = await this.getUserRole();
        return user?.role === 'USER';
    }

    static getHeader() {
        const token = this.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }


    //Register USER
    static async registerUser(body) {
        const resp = await axios.post(`${this.API_URL}/auth/register`, body);
        return resp.data;
    }

    //Login USER
    static async loginUser(body) {
        const resp = await axios.post(`${this.API_URL}/auth/login`, body);
        return resp.data;
    }

    //Get all users for task assignment
    static async getAllUsers() {
        const resp = await axios.get(`${this.API_URL}/users`, {
            headers: this.getHeader()
        });
        return resp.data;
    }



  //TASKS API
  static async createTask(body) {
    const resp = await axios.post(`${this.API_URL}/tasks`, body, {
      headers: this.getHeader()
    });
    return resp.data;
  }


  static async updateTask(body) {
    const resp = await axios.put(`${this.API_URL}/tasks/${body.id}`, body, {
      headers: this.getHeader()
    });
    return resp.data;
  }


  static async getAllMyTasks() {
    const resp = await axios.get(`${this.API_URL}/tasks`, {
      headers: this.getHeader(),
    });
    return resp.data;
  }


  static async getTaskById(taskId) {
    const resp = await axios.get(`${this.API_URL}/tasks/${taskId}`, {
      headers: this.getHeader()
    });
    return resp.data;
  }


  static async deleteTask(taskId) {
    const resp = await axios.delete(`${this.API_URL}/tasks/${taskId}`, {
      headers: this.getHeader()
    });
    return resp.data;
  }


  static async getMyTasksByCompletionStatus(completed) {
    const resp = await axios.get(`${this.API_URL}/tasks/status`, {
      headers: this.getHeader(),
      params: {
        completed: completed
      }
    });
    return resp.data;
  }

  static async getMyTasksByPriority(priority) {
    const resp = await axios.get(`${this.API_URL}/tasks/priority`, {
      headers: this.getHeader(),
      params: {
        priority: priority
      }
    });
    return resp.data;
  }

  // New method for filtering tasks by status and assignee
  static async getTasksWithFilters(status, assigneeId) {
    const resp = await axios.get(`${this.API_URL}/tasks`, {
      headers: this.getHeader(),
      params: {
        status: status,
        assignee: assigneeId
      }
    });
    return resp.data;
  }

  static async getAllTasks() {
    const resp = await axios.get(`${this.API_URL}/tasks/all`, {
      headers: this.getHeader()
    });
    return resp.data;
  }

  // Comment-related methods
  static async addComment(taskId, comment) {
    const resp = await axios.post(`${this.API_URL}/tasks/${taskId}/comments`, { comment }, {
      headers: this.getHeader()
    });
    return resp.data;
  }

  static async getTaskComments(taskId) {
    const resp = await axios.get(`${this.API_URL}/tasks/${taskId}/comments`, {
      headers: this.getHeader()
    });
    return resp.data;
  }

  static async updateComment(commentId, comment) {
    const resp = await axios.put(`${this.API_URL}/tasks/comments/${commentId}`, { comment }, {
      headers: this.getHeader()
    });
    return resp.data;
  }

  static async deleteComment(commentId) {
    const resp = await axios.delete(`${this.API_URL}/tasks/comments/${commentId}`, {
      headers: this.getHeader()
    });
    return resp.data;
  }

  // Role-based permission methods
  static async canCreateTasks() {
    return await this.isAdmin();
  }

  static async canDeleteTasks() {
    return await this.isAdmin();
  }

  static async canUpdateTasks() {
    return await this.isAdmin();
  }

  static async canAssignTasks() {
    return await this.isAdmin();
  }

  static async canCommentOnTasks() {
    const isAdmin = await this.isAdmin();
    const isUser = await this.isUser();
    return isAdmin || isUser; // Both admin and user can comment
  }

  static async canMoveTaskStatus() {
    const isAdmin = await this.isAdmin();
    const isUser = await this.isUser();
    return isAdmin || isUser; // Both admin and user can move status
  }

  static async canViewTasks() {
    const isAdmin = await this.isAdmin();
    const isUser = await this.isUser();
    return isAdmin || isUser; // Both admin and user can view
  }

  static async canEditComment(commentUsername) {
    const currentUser = await this.getCurrentUser();
    const isAdmin = await this.isAdmin();
    
    // Can edit if: admin OR owns the comment
    return isAdmin || (currentUser && currentUser.username === commentUsername);
  }

  static async canDeleteComment(commentUsername) {
    const currentUser = await this.getCurrentUser();
    const isAdmin = await this.isAdmin();
    
    // Can delete if: admin OR owns the comment
    return isAdmin || (currentUser && currentUser.username === commentUsername);
  }


}