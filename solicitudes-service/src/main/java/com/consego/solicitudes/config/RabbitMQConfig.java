package com.consego.solicitudes.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de RabbitMQ para solicitudes-service según directiva de rúbrica:
 * - TopicExchange("consego.events.tx")
 * - Queue("consego.audit.queue")
 * - Binding con routing key "solicitud.#"
 * - Jackson2JsonMessageConverter para el RabbitTemplate.
 */
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "consego.events.tx";
    public static final String QUEUE_NAME = "consego.audit.queue";
    public static final String ROUTING_KEY_PATTERN = "solicitud.#";

    public static final String ROUTING_KEY_CREADA = "solicitud.creada";
    public static final String ROUTING_KEY_ACTUALIZADA = "solicitud.actualizada";
    public static final String ROUTING_KEY_ELIMINADA = "solicitud.eliminada";

    @Bean
    public TopicExchange consegoEventsExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue auditQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public Binding auditBinding(Queue auditQueue, TopicExchange consegoEventsExchange) {
        return BindingBuilder.bind(auditQueue)
                .to(consegoEventsExchange)
                .with(ROUTING_KEY_PATTERN);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
