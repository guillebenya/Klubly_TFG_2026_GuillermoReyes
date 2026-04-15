package com.klubly.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan(basePackages = {"com.klubly"})
@EnableJpaRepositories(basePackages = {"com.klubly"})
@ComponentScan(basePackages = {"com.klubly"})
public class KlublyApplication {

	public static void main(String[] args) {
		SpringApplication.run(KlublyApplication.class, args);
	}

}
