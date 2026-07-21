const PDFDocument = require("pdfkit");
const Interview = require("../models/Interview");
const User = require("../models/User");
const InterviewAnswer = require("../models/InterviewAnswer");

exports.generatePdfReport = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch interview details
    const interview = await Interview.findById(id).populate("user_id", "full_name email");

    if (!interview || !interview.user_id) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    const full_name = interview.user_id.full_name;
    const email = interview.user_id.email;

    // 2. Fetch answers
    const answers = await InterviewAnswer.find({ interview_id: id }).sort({ question_index: 1 });

    // Calculate average WPM across answers
    const answersWithWpm = answers.filter(a => a.wpm > 0);
    const avgWpm = answersWithWpm.length > 0
      ? answersWithWpm.reduce((acc, a) => acc + a.wpm, 0) / answersWithWpm.length
      : 0;

    // 3. Create PDF Document
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // Stream the PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Intervue-Report-${id}.pdf"`);
    doc.pipe(res);

    // --- Header ---
    doc.fillColor("#4f46e5")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("INTERVUE.AI", { align: "left" });

    doc.fillColor("#6b7280")
       .font("Helvetica")
       .fontSize(10)
       .text("Next-Generation AI Voice Mock Platform", { align: "left" })
       .moveDown(1.5);

    // Divider line
    doc.strokeColor("#e5e7eb")
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke()
       .moveDown(1);

    // --- Candidate and Session info ---
    doc.fillColor("#1f2937")
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("Performance Assessment Report");

    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#4b5563")
       .text(`Candidate: ${full_name} (${email})`)
       .text(`Session: ${interview.title}`)
       .text(`Date: ${new Date(interview.created_at).toLocaleDateString()} ${new Date(interview.created_at).toLocaleTimeString()}`)
       .moveDown(1.5);

    // --- Score Summary Dashboard (Table style) ---
    doc.fillColor("#f3f4f6")
       .rect(50, doc.y, 500, 70)
       .fill();

    const currentY = doc.y;
    
    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(20)
       .text(`${(interview.overall_score || 0).toFixed(1)}/10`, 70, currentY + 15, { width: 100 })
       .fontSize(8)
       .font("Helvetica")
       .fillColor("#6b7280")
       .text("OVERALL SCORE", 70, currentY + 40);

    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(20)
       .text(`${Math.round(interview.attention_score || 100)}%`, 180, currentY + 15, { width: 100 })
       .fontSize(8)
       .font("Helvetica")
       .fillColor("#6b7280")
       .text("GAZE ATTENTION", 180, currentY + 40);

    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(20)
       .text(`${Math.round(avgWpm)}`, 290, currentY + 15, { width: 100 })
       .fontSize(8)
       .font("Helvetica")
       .fillColor("#6b7280")
       .text("PACE (WORDS/MIN)", 290, currentY + 40);

    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(20)
       .text(`${interview.look_away_count || 0}`, 410, currentY + 15, { width: 100 })
       .fontSize(8)
       .font("Helvetica")
       .fillColor("#6b7280")
       .text("LOOK AWAY EVENTS", 410, currentY + 40);

    doc.y = currentY + 85;
    doc.x = 50;

    // --- Question Breakdown ---
    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(14)
       .text("Question-by-Question breakdown")
       .moveDown(0.8);

    answers.forEach((ans, idx) => {
      if (doc.y > 650) {
        doc.addPage();
      }

      const qStart = doc.y;
      doc.fillColor("#fafafa")
         .rect(50, qStart, 500, 10)
         .fill();

      doc.fillColor("#4f46e5")
         .font("Helvetica-Bold")
         .fontSize(9)
         .text(`QUESTION ${idx + 1} (${(ans.category || 'GENERAL').toUpperCase()}) - SCORE: ${ans.score.toFixed(1)}/10`);

      doc.fillColor("#111827")
         .font("Helvetica-Bold")
         .fontSize(10)
         .text(ans.question_text || '')
         .moveDown(0.3);

      doc.fillColor("#374151")
         .font("Helvetica-Oblique")
         .fontSize(9)
         .text(`"Your Response: ${ans.answer_text || 'No spoken answer response recorded.'}"`, { indent: 10 })
         .moveDown(0.5);

      doc.fillColor("#10b981")
         .font("Helvetica-Bold")
         .fontSize(9)
         .text("AI Feedback:");
      
      doc.fillColor("#4b5563")
         .font("Helvetica")
         .fontSize(9)
         .text(ans.feedback || "Actionable feedback being compiled by AI coach...")
         .moveDown(0.5);

      if (ans.model_answer) {
        doc.fillColor("#2563eb")
           .font("Helvetica-Bold")
           .fontSize(9)
           .text("Ideal/Model Answer Recommendation:");
        doc.fillColor("#4b5563")
           .font("Helvetica")
           .fontSize(9)
           .text(ans.model_answer)
           .moveDown(1);
      }

      doc.strokeColor("#e5e7eb")
         .lineWidth(0.5)
         .moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(0.8);
    });

    // --- Study Roadmap Recommendations ---
    if (interview.recommendations_json) {
      try {
        const roadmaps = JSON.parse(interview.recommendations_json);
        if (roadmaps && roadmaps.length > 0) {
          if (doc.y > 550) {
            doc.addPage();
          }

          doc.fillColor("#111827")
             .font("Helvetica-Bold")
             .fontSize(14)
             .text("Personalized Study Roadmaps")
             .moveDown(0.5);

          roadmaps.forEach((roadmap) => {
            doc.fillColor("#4f46e5")
               .font("Helvetica-Bold")
               .fontSize(11)
               .text(`🎯 Topic: ${roadmap.topic}`)
               .moveDown(0.2);

            roadmap.links.forEach((link) => {
              doc.fillColor("#2563eb")
                 .font("Helvetica")
                 .fontSize(9)
                 .text(`- ${link.name}: ${link.url}`, { link: link.url })
                 .moveDown(0.15);
            });
            doc.moveDown(0.5);
          });
        }
      } catch (e) {
        console.error("Failed to append recommendations in PDF:", e);
      }
    }

    // --- Footer page numbers ---
    let pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor("#9ca3af")
         .font("Helvetica")
         .fontSize(8)
         .text(`Page ${i + 1} of ${pages.count}`, 50, 750, { align: "center", width: 500 });
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
};
