"use client";

import React, { useState } from "react";
import {
  useGetAdminFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from "@/services/api/faqApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Plus, Save, X, GripVertical } from "lucide-react";

interface FAQForm {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const emptyForm: FAQForm = {
  question: "",
  answer: "",
  order: 0,
  isActive: true,
};

export default function AdminFAQsPage() {
  const { data: faqs = [], isLoading } = useGetAdminFAQsQuery();
  const [createFAQ] = useCreateFAQMutation();
  const [updateFAQ] = useUpdateFAQMutation();
  const [deleteFAQ] = useDeleteFAQMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);

  const handleCreate = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    await createFAQ(form);
    setForm(emptyForm);
    setIsCreating(false);
  };

  const handleUpdate = async (id: string) => {
    if (!form.question.trim() || !form.answer.trim()) return;
    await updateFAQ({ id, data: form });
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this FAQ?")) {
      await deleteFAQ(id);
    }
  };

  const startEdit = (faq: any) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isActive: faq.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsCreating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQ Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage frequently asked questions</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">New FAQ</h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Question</label>
            <Input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter question..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Answer</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Enter answer..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Order</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} className="gap-1">
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-10 text-slate-400">No FAQs yet. Add your first FAQ.</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className={`bg-white rounded-xl border p-4 ${
                editingId === faq._id ? "border-blue-300" : "border-slate-200"
              }`}
            >
              {editingId === faq._id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Question</label>
                    <Input
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Answer</label>
                    <textarea
                      value={form.answer}
                      onChange={(e) => setForm({ ...form, answer: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Order</label>
                      <Input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-sm font-semibold text-slate-700">Active</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(faq._id)} size="sm" className="gap-1">
                      <Save className="w-3.5 h-3.5" /> Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        faq.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {faq.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <span className="text-[10px] text-slate-400">Order: {faq.order}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{faq.question}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(faq)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
