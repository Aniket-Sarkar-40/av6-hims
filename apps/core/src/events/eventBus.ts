import { EventEmitter } from "node:events";
import ApprovalService from "@/services/approval/approval.service.js";
import { db } from "@repo/db";

export const eventBus = new EventEmitter({ captureRejections: true });

export const approvalService = new ApprovalService(db, eventBus);
