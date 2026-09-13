"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconUpload,
  IconFileSpreadsheet,
  IconDownload,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconArrowRight,
} from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { QuestionDraft } from "./QuizEditorForm";

interface ExcelQuestionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: QuestionDraft[], mode: "replace" | "append") => void;
  existingCount: number;
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      "Question": "What parameter does Darcy's Law primarily calculate in porous media flow?",
      "Option A": "Fluid Flow Rate / Permeability",
      "Option B": "Viscosity Index",
      "Option C": "Capillary Pressure",
      "Option D": "Rock Compressibility",
      "Correct Option": "A",
      "Time Limit": 20,
      "Points": 10,
      "Image URL": "",
    },
    {
      "Question": "Which SPE technical discipline focuses on artificial lift and well stimulation?",
      "Option A": "Reservoir Description and Dynamics",
      "Option B": "Production and Operations",
      "Option C": "Drilling and Completions",
      "Option D": "Management and Information",
      "Correct Option": "B",
      "Time Limit": 15,
      "Points": 10,
      "Image URL": "",
    },
    {
      "Question": "What is the primary unit used to measure API Gravity?",
      "Option A": "Degrees API (°API)",
      "Option B": "Psi per foot",
      "Option C": "Centipoise",
      "Option D": "Barrels per day",
      "Correct Option": "A",
      "Time Limit": 20,
      "Points": 20,
      "Image URL": "",
    },
    {
      "Question": "What does GOR stand for in petroleum reservoir engineering?",
      "Option A": "Gas-Oil Ratio",
      "Option B": "Geothermal Output Rate",
      "Option C": "Gross Operating Return",
      "Option D": "Gravity Offset Reading",
      "Correct Option": "A",
      "Time Limit": 20,
      "Points": 10,
      "Image URL": "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet["!cols"] = [
    { wch: 50 }, // Question
    { wch: 30 }, // Option A
    { wch: 30 }, // Option B
    { wch: 30 }, // Option C
    { wch: 30 }, // Option D
    { wch: 16 }, // Correct Option
    { wch: 12 }, // Time Limit
    { wch: 10 }, // Points
    { wch: 25 }, // Image URL
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Showdown Questions");
  XLSX.writeFile(workbook, "SPE_Showdown_Questions_Template.xlsx");
}

export function parseQuestionsFromExcel(data: ArrayBuffer | Uint8Array): {
  questions: QuestionDraft[];
  errors: string[];
} {
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { questions: [], errors: ["The spreadsheet has no sheets."] };
  }
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) {
    return { questions: [], errors: ["Sheet is empty. Please add question rows."] };
  }

  const parsedQuestions: QuestionDraft[] = [];
  const errors: string[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const qText = (
      row["Question"] ||
      row["question"] ||
      row["Question Text"] ||
      row["question_text"] ||
      row["Prompt"] ||
      row["prompt"] ||
      ""
    ).toString().trim();

    if (!qText) {
      errors.push(`Row ${rowNum}: Empty question text skipped.`);
      return;
    }

    const optA = (row["Option A"] || row["OptionA"] || row["option_a"] || row["A"] || row["Choice A"] || row["Choice 1"] || "").toString().trim();
    const optB = (row["Option B"] || row["OptionB"] || row["option_b"] || row["B"] || row["Choice B"] || row["Choice 2"] || "").toString().trim();
    const optC = (row["Option C"] || row["OptionC"] || row["option_c"] || row["C"] || row["Choice C"] || row["Choice 3"] || "").toString().trim();
    const optD = (row["Option D"] || row["OptionD"] || row["option_d"] || row["D"] || row["Choice D"] || row["Choice 4"] || "").toString().trim();

    if (!optA || !optB) {
      errors.push(`Row ${rowNum}: Question "${qText.slice(0, 25)}..." requires at least Option A and Option B.`);
      return;
    }

    const optionsRaw = [
      { id: 1, text: optA },
      { id: 2, text: optB },
      { id: 3, text: optC },
      { id: 4, text: optD },
    ];

    const correctRaw = (
      row["Correct Option"] ||
      row["Correct Answer"] ||
      row["Correct"] ||
      row["Answer"] ||
      row["Key"] ||
      row["correct_option"] ||
      row["correct_answer"] ||
      "A"
    ).toString().trim().toUpperCase();

    let correctIndex = 0;
    if (correctRaw === "A" || correctRaw === "1" || correctRaw === "OPTION A") {
      correctIndex = 0;
    } else if (correctRaw === "B" || correctRaw === "2" || correctRaw === "OPTION B") {
      correctIndex = 1;
    } else if (correctRaw === "C" || correctRaw === "3" || correctRaw === "OPTION C") {
      correctIndex = 2;
    } else if (correctRaw === "D" || correctRaw === "4" || correctRaw === "OPTION D") {
      correctIndex = 3;
    } else {
      const matchIdx = optionsRaw.findIndex(
        (o) => o.text && o.text.toLowerCase() === correctRaw.toLowerCase()
      );
      if (matchIdx !== -1) {
        correctIndex = matchIdx;
      } else {
        correctIndex = 0;
      }
    }

    const rawTimer = parseInt(
      (row["Time Limit"] || row["Timer"] || row["time_limit"] || row["Seconds"] || row["time"] || "20").toString(),
      10
    );
    const time_limit = !isNaN(rawTimer) && rawTimer > 0 ? rawTimer : 20;

    const rawPoints = parseInt(
      (row["Points"] || row["Score"] || row["points"] || row["pts"] || "10").toString(),
      10
    );
    const points = !isNaN(rawPoints) && rawPoints >= 0 ? rawPoints : 10;

    const image_url = (
      row["Image URL"] ||
      row["Image"] ||
      row["image_url"] ||
      row["Diagram"] ||
      row["Diagram URL"] ||
      ""
    ).toString().trim();

    const options = optionsRaw.map((opt, i) => ({
      id: opt.id,
      text: opt.text,
      is_correct: i === correctIndex,
    }));

    parsedQuestions.push({
      question_text: qText,
      image_url: image_url || undefined,
      time_limit,
      points,
      options,
    });
  });

  return { questions: parsedQuestions, errors };
}

export default function ExcelQuestionUploadModal({
  isOpen,
  onClose,
  onImport,
  existingCount,
}: ExcelQuestionUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<QuestionDraft[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<"replace" | "append">(
    existingCount > 0 ? "append" : "replace"
  );
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFileName("");
    setParsedQuestions([]);
    setParseErrors([]);
    setProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setProcessing(true);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const { questions, errors } = parseQuestionsFromExcel(buffer);
        setParsedQuestions(questions);
        setParseErrors(errors);
      } catch (err: any) {
        setParseErrors(["Failed to parse spreadsheet. Please ensure it is a valid Excel or CSV file."]);
        setParsedQuestions([]);
      } finally {
        setProcessing(false);
      }
    };
    reader.onerror = () => {
      setParseErrors(["Failed to read file."]);
      setProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleImportClick = () => {
    if (parsedQuestions.length === 0) return;
    onImport(parsedQuestions, importMode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Bulk Question Upload
              </span>
              <h2 className="text-xl font-black text-gray-950 tracking-tight">
                Import Questions from Spreadsheet
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* Step 1: Download Template Helper */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900">Need the standard spreadsheet format?</p>
                <p className="text-[11px] text-gray-500 font-medium">
                  Includes pre-filled petroleum & chapter questions with headers (Question, Option A–D, Correct Option, Time Limit, Points).
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleExcelTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-100 hover:border-gray-300 transition-colors shrink-0 cursor-pointer"
              >
                <IconDownload size={14} className="text-blue-600" />
                <span>Download Template (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: Upload Dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                dragActive
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <IconFileSpreadsheet size={24} />
              </div>

              {fileName ? (
                <div>
                  <p className="text-xs font-black text-gray-950 mb-0.5">{fileName}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Click to choose a different spreadsheet</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-black text-gray-950 mb-1">
                    Drag and drop your Excel (.xlsx, .xls) or CSV file here
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Or click to browse from your device
                  </p>
                </div>
              )}
            </div>

            {/* Processing Spinner */}
            {processing && (
              <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
                <IconLoader2 size={18} className="animate-spin text-blue-600" />
                <span>Parsing questions from spreadsheet...</span>
              </div>
            )}

            {/* Parse Warnings / Errors */}
            {parseErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <IconAlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>Notices ({parseErrors.length})</span>
                </div>
                <div className="max-h-24 overflow-y-auto text-[11px] space-y-0.5 pr-1">
                  {parseErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Parsed Questions Summary & Preview */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-gray-900">
                      {parsedQuestions.length} Questions Ready to Import
                    </span>
                  </div>
                </div>

                {/* Import Mode Option */}
                {existingCount > 0 && (
                  <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-gray-50 border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setImportMode("append")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        importMode === "append"
                          ? "bg-white text-blue-700 border border-blue-100"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Append (+{parsedQuestions.length} to existing {existingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode("replace")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        importMode === "replace"
                          ? "bg-white text-red-600 border border-red-100"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Replace All ({existingCount} will be overwritten)
                    </button>
                  </div>
                )}

                {/* Preview Cards */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {parsedQuestions.slice(0, 5).map((q, idx) => {
                    const correctOpt = q.options.find((o) => o.is_correct);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-left flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                              Q{idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {q.time_limit}s • {q.points} pts
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 truncate">{q.question_text}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                            Correct: {correctOpt?.text ? correctOpt.text.slice(0, 15) : "Option A"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {parsedQuestions.length > 5 && (
                    <p className="text-center text-[10px] font-bold text-gray-400 py-1">
                      + {parsedQuestions.length - 5} more questions in this file
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImportClick}
              disabled={parsedQuestions.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Import {parsedQuestions.length > 0 ? `${parsedQuestions.length} Questions` : "Questions"}</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
