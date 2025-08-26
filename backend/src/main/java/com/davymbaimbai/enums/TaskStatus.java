package com.davymbaimbai.enums;

public enum TaskStatus {
    TODO, IN_PROGRESS, DONE;
    public boolean canTransitionTo(TaskStatus newStatus) {
        switch (this) {
            case TODO:
                return newStatus == IN_PROGRESS;
            case IN_PROGRESS:
                return newStatus == DONE || newStatus == TODO;
            case DONE:
                return newStatus == IN_PROGRESS;
            default:
                return false;
        }
    }
}
