package com.example.demo.emailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	@Autowired
	private JavaMailSender mailSender;
	@Value("${spring.mail.username}")
	private String fromEmail;

	public void sendEmail(String toEmail, String subject, String body) {
		MimeMessage message = mailSender.createMimeMessage();
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(body);
			mailSender.send(message);
		} catch (MessagingException e) {
			throw new RuntimeException("failed to send the mail");
		}
	}

	public void sendPostPublishedMail(String toEmail, String subject, String body) {
		MimeMessage message = mailSender.createMimeMessage();
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(body);
			mailSender.send(message);
			
		} catch (MessagingException e) {
			throw new RuntimeException("failed to send the mail");
		}
	}
}
