package com.consego.auth.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de RabbitMQ para auth-service:
 * Emite eventos de auditoría para registro y admisión de usuarios hacia TopicExchange 'consego.events.tx'.
 */
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "consego.events.tx";

    public static final String ROUTING_KEY_REGISTRADO = "usuario.registrado";
    public static final String ROUTING_KEY_APROBADO = "usuario.aprobado";
    public static final String ROUTING_KEY_RECHAZADO = "usuario.rechazado";

    @Bean
    public TopicExchange consegoEventsExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
