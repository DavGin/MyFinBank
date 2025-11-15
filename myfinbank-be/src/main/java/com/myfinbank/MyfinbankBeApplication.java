package com.myfinbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MyfinbankBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyfinbankBeApplication.class, args);
	}

}
